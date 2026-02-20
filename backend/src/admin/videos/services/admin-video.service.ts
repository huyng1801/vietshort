import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../config/database.config';
import { RedisService } from '../../../config/redis.config';
import { R2StorageService } from './r2-storage.service';
import { VideoQueueService } from './video-queue.service';
import { VideoStatus, EncodingStatus, VipType, AgeRating } from '@prisma/client';

// ─── DTOs ────────────────────────────────────────────────
export interface AdminCreateVideoDto {
  title: string;
  description?: string;
  slug?: string;
  poster?: string;
  releaseYear?: number;
  director?: string;
  actors?: string;
  country?: string;
  language?: string;
  genres?: string;
  isSerial?: boolean;
  totalEpisodes?: number;
  ageRating?: AgeRating;
  isVipOnly?: boolean;
  vipTier?: VipType;
  unlockPrice?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export interface AdminUpdateVideoDto extends Partial<AdminCreateVideoDto> {
  status?: VideoStatus;
}

export interface AdminCreateEpisodeDto {
  episodeNumber: number;
  title?: string;
  description?: string;
  unlockPrice?: number;
}

export interface AdminQueryVideoDto {
  search?: string;
  status?: VideoStatus;
  genre?: string;
  country?: string;
  isVipOnly?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminVideoService {
  private readonly logger = new Logger(AdminVideoService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private r2StorageService: R2StorageService,
    private videoQueueService: VideoQueueService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // 1. VIDEO CRUD (series/movie metadata)
  // ═══════════════════════════════════════════════════════════

  async createVideo(dto: AdminCreateVideoDto) {
    const slug = dto.slug || await this.generateSlug(dto.title);
    const video = await this.prisma.video.create({
      data: {
        title: dto.title,
        description: dto.description,
        slug,
        poster: dto.poster,
        releaseYear: dto.releaseYear,
        director: dto.director,
        actors: dto.actors,
        country: dto.country,
        language: dto.language || 'vi',
        genres: dto.genres,
        isSerial: dto.isSerial ?? true,
        totalEpisodes: dto.totalEpisodes,
        ageRating: dto.ageRating || AgeRating.ALL,
        isVipOnly: dto.isVipOnly ?? false,
        vipTier: dto.vipTier,
        unlockPrice: dto.unlockPrice,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        keywords: dto.keywords,
        status: VideoStatus.DRAFT,
      },
      include: { episodes: true },
    });

    this.logger.log(`Video created: ${video.id} - ${video.title}`);
    return video;
  }

  async updateVideo(id: string, dto: AdminUpdateVideoDto) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    const updateData: any = { ...dto };
    // If publishing, set publishedAt
    if (dto.status === VideoStatus.PUBLISHED && !video.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await this.prisma.video.update({
      where: { id },
      data: updateData,
      include: { episodes: { orderBy: { episodeNumber: 'asc' } } },
    });

    // Invalidate cache
    await this.redisService.del(`video:${id}`);
    await this.redisService.del(`video:slug:${video.slug}`);
    return updated;
  }

  async deleteVideo(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    await this.prisma.video.delete({ where: { id } });
    await this.redisService.del(`video:${id}`);
    await this.redisService.del(`video:slug:${video.slug}`);
    return { success: true, message: 'Đã xóa video' };
  }

  async getVideo(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: { episodeNumber: 'asc' },
          include: { subtitles: true },
        },
        _count: { select: { comments: true, likes: true, favorites: true } },
      },
    });
    if (!video) throw new NotFoundException('Video không tồn tại');
    return video;
  }

  async getVideos(query: AdminQueryVideoDto) {
    const {
      search, page = 1, limit = 20,
      status, genre, country, isVipOnly,
      sort = 'createdAt', order = 'desc',
    } = query;

    const where: any = {};
    if (status) where.status = status;
    if (genre) {
      // Filter by genre in CSV string
      where.genres = { contains: genre };
    }
    if (country) where.country = country;
    if (isVipOnly !== undefined) where.isVipOnly = isVipOnly;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          episodes: { select: { id: true, episodeNumber: true, encodingStatus: true } },
          _count: { select: { episodes: true, comments: true } },
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUniqueGenres() {
    // Lấy tất cả videos có genres
    const videos = await this.prisma.video.findMany({
      where: {
        genres: { not: null },
      },
      select: { genres: true },
    });

    // Extract unique genres từ comma-separated strings
    const genresSet = new Set<string>();
    videos.forEach(video => {
      if (video.genres) {
        video.genres.split(',').forEach(genre => {
          const trimmed = genre.trim();
          if (trimmed) genresSet.add(trimmed);
        });
      }
    });

    // Convert to array và sort alphabetically
    const uniqueGenres = Array.from(genresSet).sort();
    return uniqueGenres.map(name => ({ name, value: name }));
  }

  // ═══════════════════════════════════════════════════════════
  // 2. EPISODE CRUD
  // ═══════════════════════════════════════════════════════════

  async createEpisode(videoId: string, dto: AdminCreateEpisodeDto) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    // Check duplicate episode number
    const existing = await this.prisma.episode.findUnique({
      where: { videoId_episodeNumber: { videoId, episodeNumber: dto.episodeNumber } },
    });
    if (existing) {
      throw new BadRequestException(`Tập ${dto.episodeNumber} đã tồn tại`);
    }

    const episode = await this.prisma.episode.create({
      data: {
        videoId,
        episodeNumber: dto.episodeNumber,
        title: dto.title || `Tập ${dto.episodeNumber}`,
        description: dto.description,
        unlockPrice: dto.unlockPrice,
        encodingStatus: EncodingStatus.PENDING,
        encodingProgress: 0,
      },
    });

    this.logger.log(`Episode created: ${episode.id} - Video ${videoId} - Tập ${dto.episodeNumber}`);
    return episode;
  }

  async updateEpisode(episodeId: string, dto: Partial<AdminCreateEpisodeDto>) {
    const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
    if (!episode) throw new NotFoundException('Tập phim không tồn tại');

    return this.prisma.episode.update({
      where: { id: episodeId },
      data: {
        title: dto.title,
        description: dto.description,
        unlockPrice: dto.unlockPrice,
      },
    });
  }

  async deleteEpisode(episodeId: string) {
    const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
    if (!episode) throw new NotFoundException('Tập phim không tồn tại');

    await this.prisma.episode.delete({ where: { id: episodeId } });
    return { success: true, message: 'Đã xóa tập phim' };
  }

  async getEpisodes(videoId: string) {
    return this.prisma.episode.findMany({
      where: { videoId },
      orderBy: { episodeNumber: 'asc' },
      include: {
        subtitles: { select: { id: true, language: true, isAuto: true } },
      },
    });
  }

  async getEpisode(episodeId: string) {
    const ep = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        video: { select: { id: true, title: true, slug: true } },
        subtitles: true,
      },
    });
    if (!ep) throw new NotFoundException('Tập phim không tồn tại');
    return ep;
  }

  // ═══════════════════════════════════════════════════════════
  // 3. PRESIGNED UPLOAD URL
  // ═══════════════════════════════════════════════════════════

  async getEpisodeUploadUrl(episodeId: string, contentType: string) {
    try {
      this.logger.log(`Getting upload URL for episode ${episodeId} with content type ${contentType}`);
      
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        include: { video: { select: { id: true, title: true } } },
      });
      if (!episode) {
        this.logger.error(`Episode not found: ${episodeId}`);
        throw new NotFoundException('Tập phim không tồn tại');
      }

      this.logger.log(`Found episode: ${episode.id} (${episode.title}) for video: ${episode.video.title}`);

      // Only allow upload when PENDING or FAILED
      if (episode.encodingStatus === EncodingStatus.PROCESSING) {
        this.logger.warn(`Episode ${episodeId} is currently processing, cannot upload`);
        throw new BadRequestException('Tập phim đang được encode, không thể upload lại');
      }
      if (episode.encodingStatus === EncodingStatus.COMPLETED) {
        this.logger.warn(`Episode ${episodeId} is already completed, cannot upload`);
        throw new BadRequestException('Tập phim đã encode xong. Xóa và tạo lại nếu muốn thay đổi');
      }

      this.logger.log(`Generating upload URL for video ${episode.video.id}, episode ${episode.episodeNumber}`);
      
      const { uploadUrl, sourceKey } = await this.r2StorageService.generateUploadUrl(
        episode.video.id,
        episode.episodeNumber,
        contentType,
      );

      // Save sourceUrl to episode
      await this.prisma.episode.update({
        where: { id: episodeId },
        data: { sourceUrl: sourceKey },
      });

      this.logger.log(`Upload URL generated successfully for episode ${episodeId}: ${sourceKey}`);

      return {
        uploadUrl,
        sourceKey,
        episodeId,
        expiresIn: 3600,
        contentType,
      };
    } catch (error) {
      this.logger.error(`Failed to get upload URL for episode ${episodeId}: ${(error as any)?.message || error}`, (error as Error)?.stack);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 3.5. VERIFY UPLOAD
  // ═══════════════════════════════════════════════════════════

  async verifyEpisodeUpload(episodeId: string) {
    try {
      this.logger.log(`Verifying upload for episode: ${episodeId}`);
      
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        include: { video: { select: { id: true, title: true } } },
      });
      if (!episode) {
        this.logger.error(`Episode not found for verification: ${episodeId}`);
        throw new NotFoundException('Tập phim không tồn tại');
      }

      if (!episode.sourceUrl) {
        this.logger.warn(`Episode ${episodeId} has no source URL to verify`);
        return {
          episodeId,
          uploaded: false,
          message: 'Chưa có source URL để kiểm tra',
        };
      }

      this.logger.log(`Checking upload status for source: ${episode.sourceUrl}`);
      
      // Check if file exists in R2
      const checkResult = await this.r2StorageService.checkObjectExists(episode.sourceUrl);
      
      if (checkResult.exists) {
        this.logger.log(`Upload verified for episode ${episodeId}: ${checkResult.contentLength} bytes, modified: ${checkResult.lastModified}`);
        
        // Update episode status if it was pending
        if (episode.encodingStatus === EncodingStatus.PENDING) {
          await this.prisma.episode.update({
            where: { id: episodeId },
            data: { encodingStatus: EncodingStatus.PENDING }, // Ready for processing
          });
        }
        
        return {
          episodeId,
          uploaded: true,
          sourceUrl: episode.sourceUrl,
          contentLength: checkResult.contentLength,
          lastModified: checkResult.lastModified,
          message: 'Upload thành công',
        };
      } else {
        this.logger.warn(`Upload not found for episode ${episodeId}, source: ${episode.sourceUrl}`);
        return {
          episodeId,
          uploaded: false,
          sourceUrl: episode.sourceUrl,
          message: 'File chưa được upload hoặc không tồn tại',
        };
      }
    } catch (error) {
      this.logger.error(`Failed to verify upload for episode ${episodeId}: ${(error as any)?.message || error}`, (error as Error)?.stack);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 4. TRIGGER ENCODE (ASYNC)
  // ═══════════════════════════════════════════════════════════

  async processEpisode(episodeId: string) {
    try {
      this.logger.log(`Starting to process episode: ${episodeId}`);
      
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        include: { video: { select: { id: true, title: true } } },
      });
      if (!episode) {
        this.logger.error(`Episode not found for processing: ${episodeId}`);
        throw new NotFoundException('Tập phim không tồn tại');
      }

      this.logger.log(`Found episode: ${episode.title} for video: ${episode.video.title}`);

      if (!episode.sourceUrl) {
        this.logger.error(`Episode ${episodeId} has no source URL, cannot process`);
        throw new BadRequestException('Chưa upload file gốc cho tập phim này');
      }

      if (episode.encodingStatus === EncodingStatus.PROCESSING) {
        this.logger.warn(`Episode ${episodeId} is already processing`);
        throw new BadRequestException('Tập phim đang được encode');
      }

      this.logger.log(`Generating download URL for source: ${episode.sourceUrl}`);
      
      // Get signed download URL for the encode worker
      const downloadUrl = await this.r2StorageService.generateDownloadUrl(episode.sourceUrl);

      this.logger.log(`Adding episode ${episodeId} to encoding queue`);
      
      // Push to encoding queue
      await this.videoQueueService.addToEncodingQueue(episodeId, downloadUrl);

      this.logger.log(`Successfully triggered encoding for episode ${episodeId}`);

      return {
        episodeId,
        encodingStatus: EncodingStatus.PROCESSING,
        message: 'Đã bắt đầu mã hóa video',
      };
    } catch (error) {
      this.logger.error(`Failed to process episode ${episodeId}: ${(error as any)?.message || error}`, (error as Error)?.stack);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 5. REPROCESS (RETRY FAILED)
  // ═══════════════════════════════════════════════════════════

  async reprocessEpisode(episodeId: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
    });
    if (!episode) throw new NotFoundException('Tập phim không tồn tại');

    if (episode.encodingStatus !== EncodingStatus.FAILED) {
      throw new BadRequestException('Chỉ có thể thử lại các tập phim bị lỗi');
    }

    // Reset status
    await this.prisma.episode.update({
      where: { id: episodeId },
      data: {
        encodingStatus: EncodingStatus.PENDING,
        encodingProgress: 0,
        encodingError: null,
      },
    });

    return this.processEpisode(episodeId);
  }

  // ═══════════════════════════════════════════════════════════
  // 6. PUBLISH VIDEO
  // ═══════════════════════════════════════════════════════════

  async publishVideo(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { episodes: true },
    });
    if (!video) throw new NotFoundException('Video không tồn tại');

    // Check at least 1 episode is COMPLETED
    const completedEpisodes = video.episodes.filter(
      (ep) => ep.encodingStatus === EncodingStatus.COMPLETED,
    );
    if (completedEpisodes.length === 0) {
      throw new BadRequestException(
        'Cần ít nhất 1 tập phim đã encode hoàn tất để xuất bản',
      );
    }

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: {
        status: VideoStatus.PUBLISHED,
        publishedAt: video.publishedAt || new Date(),
      },
      include: { episodes: { orderBy: { episodeNumber: 'asc' } } },
    });

    // Invalidate cache
    await this.redisService.del(`video:${videoId}`);
    await this.redisService.del(`video:slug:${video.slug}`);
    await this.redisService.del('trending:20');

    this.logger.log(`Video published: ${videoId} - ${video.title}`);
    return updated;
  }

  async unpublishVideo(videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.DRAFT },
      include: { episodes: { orderBy: { episodeNumber: 'asc' } } },
    });

    await this.redisService.del(`video:${videoId}`);
    await this.redisService.del(`video:slug:${video.slug}`);
    return updated;
  }

  // ═══════════════════════════════════════════════════════════
  // 7. SUBTITLE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  async addSubtitle(episodeId: string, language: string, content: string, isAuto = false) {
    const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
    if (!episode) throw new NotFoundException('Tập phim không tồn tại');

    return this.prisma.subtitle.upsert({
      where: { episodeId_language: { episodeId, language } },
      update: { content, isAuto },
      create: { episodeId, language, content, isAuto },
    });
  }

  async deleteSubtitle(subtitleId: string) {
    await this.prisma.subtitle.delete({ where: { id: subtitleId } });
    return { success: true };
  }

  // ═══════════════════════════════════════════════════════════
  // 8. ENCODING QUEUE STATUS
  // ═══════════════════════════════════════════════════════════

  async getEncodingQueue(status?: EncodingStatus, page = 1, limit = 20) {
    const where: any = {};
    if (status) where.encodingStatus = status;
    else where.encodingStatus = { in: [EncodingStatus.PENDING, EncodingStatus.PROCESSING, EncodingStatus.FAILED] };

    const [items, total] = await Promise.all([
      this.prisma.episode.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          video: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.episode.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getEncodingStats() {
    return this.videoQueueService.getQueueStatus();
  }

  // ═══════════════════════════════════════════════════════════
  // 9. POSTER UPLOAD URL
  // ═══════════════════════════════════════════════════════════

  async getPosterUploadUrl(videoId: string, contentType: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    const { uploadUrl, publicUrl } = await this.r2StorageService.generatePosterUploadUrl(
      videoId, contentType,
    );

    return {
      uploadUrl,
      publicUrl,
    };
  }

  async updatePoster(videoId: string, posterUrl: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: { poster: posterUrl },
      select: { id: true, title: true, poster: true },
    });

    // Invalidate cache
    await this.redisService.del(`video:${videoId}`);
    await this.redisService.del(`video:slug:${video.slug}`);
    
    this.logger.log(`Poster updated for video ${videoId}: ${posterUrl}`);
    return { success: true, video: updated };
  }

  // ═══════════════════════════════════════════════════════════
  // 10. R2 CONNECTION TEST & SYSTEM CHECKS
  // ═══════════════════════════════════════════════════════════

  async testR2Connection() {
    try {
      this.logger.log('Testing R2 connection from admin video service...');
      const result = await this.r2StorageService.testConnection();
      this.logger.log(`R2 test result: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
      return result;
    } catch (error) {
      this.logger.error(`R2 test failed: ${(error as any)?.message || error}`, (error as Error)?.stack);
      throw error;
    }
  }

  async checkSystemRequirements() {
    const results = {
      r2Connection: { success: false, message: '' },
      ffmpegAvailable: { success: false, message: '' },
      databaseConnection: { success: false, message: '' },
    };

    try {
      // Test R2
      results.r2Connection = await this.r2StorageService.testConnection();
    } catch (error) {
      results.r2Connection.message = `R2 test failed: ${(error as any)?.message || error}`;
    }

    try {
      // Test database
      await this.prisma.$queryRaw`SELECT 1`;
      results.databaseConnection = { success: true, message: 'Database connection OK' };
    } catch (error) {
      results.databaseConnection.message = `Database test failed: ${(error as any)?.message || error}`;
    }

    // Note: FFmpeg availability would need to be checked by the encoding service
    results.ffmpegAvailable = { 
      success: false, 
      message: 'FFmpeg availability check needs to be implemented in encode worker service' 
    };

    return results;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Safely truncate error message to fit database column limits
   */
  private truncateErrorMessage(error: any, maxLength = 1000): string {
    try {
      let message = '';
      
      if (typeof error === 'string') {
        message = error;
      } else if (error?.message) {
        message = error.message;
      } else if (error?.toString) {
        message = error.toString();
      } else {
        message = 'Unknown error occurred';
      }

      // Include error name if available
      if (error?.name && error.name !== 'Error') {
        message = `[${error.name}] ${message}`;
      }

      // Truncate if too long
      if (message.length > maxLength) {
        message = message.substring(0, maxLength - 10) + '...[TRUNCATED]';
      }

      return message;
    } catch (e) {
      return 'Error processing error message';
    }
  }

  /**
   * Update episode encoding error with safe error message
   */
  async updateEpisodeEncodingError(episodeId: string, error: any): Promise<void> {
    try {
      const errorMessage = this.truncateErrorMessage(error, 950); // Leave some margin for database
      
      await this.prisma.episode.update({
        where: { id: episodeId },
        data: {
          encodingStatus: EncodingStatus.FAILED,
          encodingError: errorMessage,
          encodingProgress: 0,
        },
      });

      this.logger.error(`Episode ${episodeId} encoding failed: ${errorMessage}`);
    } catch (updateError) {
      this.logger.error(`Failed to update episode error for ${episodeId}: ${(updateError as any)?.message || updateError}`);
      
      // Fallback: try with very short message
      try {
        await this.prisma.episode.update({
          where: { id: episodeId },
          data: {
            encodingStatus: EncodingStatus.FAILED,
            encodingError: 'Encoding failed - see logs for details',
            encodingProgress: 0,
          },
        });
      } catch (fallbackError) {
        this.logger.error(`Fallback update also failed for ${episodeId}: ${(fallbackError as any)?.message || fallbackError}`);
      }
    }
  }

  private async generateSlug(title: string): Promise<string> {
    const base = title
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = base;
    let counter = 1;
    while (await this.prisma.video.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
