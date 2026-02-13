import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../config/database.config';
import { RedisService } from '../../../config/redis.config';
import { R2StorageService } from './r2-storage.service';
import { SubtitleStatus } from '@prisma/client';

export interface CreateSubtitleDto {
  language: string;
  label?: string;
  content: string;
  isAuto?: boolean;
}

export interface GenerateSubtitleDto {
  sourceLanguage?: string; // Language of the audio (vi, en, zh, etc.)
  targetLanguage: string;  // Language to translate to
  label?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

@Injectable()
export class SubtitleService {
  private readonly logger = new Logger(SubtitleService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private r2StorageService: R2StorageService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // SUBTITLE CRUD
  // ═══════════════════════════════════════════════════════════

  /**
   * List all videos with their episodes and subtitle status
   */
  async getVideosWithSubtitles(params: {
    search?: string;
    status?: string;
    genre?: string;
    isSerial?: boolean;
    subtitleStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.genre) {
      // Filter by genre in CSV string
      where.genres = { contains: params.genre };
    }
    if (params.isSerial !== undefined) {
      where.isSerial = params.isSerial;
    }

    // Filter by subtitle status
    if (params.subtitleStatus) {
      if (params.subtitleStatus === 'COMPLETED') {
        // Has at least one completed subtitle
        where.episodes = {
          some: {
            subtitles: {
              some: {
                status: { in: ['READY', 'COMPLETED'] }
              }
            }
          }
        };
      } else if (params.subtitleStatus === 'PROCESSING') {
        // Has at least one processing subtitle
        where.episodes = {
          some: {
            subtitles: {
              some: {
                status: { in: ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'UPLOADING'] }
              }
            }
          }
        };
      } else if (params.subtitleStatus === 'FAILED') {
        // Has at least one failed subtitle
        where.episodes = {
          some: {
            subtitles: {
              some: {
                status: 'FAILED'
              }
            }
          }
        };
      } else if (params.subtitleStatus === 'NONE') {
        // Has no subtitles at all
        where.episodes = {
          every: {
            subtitles: {
              none: {}
            }
          }
        };
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          poster: true,
          isSerial: true,
          totalEpisodes: true,
          status: true,
          genres: true,
          releaseYear: true,
          createdAt: true,
          _count: { select: { episodes: true } },
          episodes: {
            orderBy: { episodeNumber: 'asc' },
            select: {
              id: true,
              episodeNumber: true,
              title: true,
              encodingStatus: true,
              subtitles: {
                select: {
                  id: true,
                  language: true,
                  label: true,
                  isAuto: true,
                  status: true,
                  progress: true,
                  error: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    // Log for debugging
    this.logger.debug(`📊 Subtitles query returned ${items.length} items`);
    if (items.length > 0) {
      this.logger.debug(`🎬 First video: ${items[0].title}, genres: ${items[0].genres || 'NULL'}`);
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all subtitles for a specific video (across all episodes)
   */
  async getVideoSubtitles(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        slug: true,
        episodes: {
          orderBy: { episodeNumber: 'asc' },
          select: {
            id: true,
            episodeNumber: true,
            subtitles: {
              orderBy: { language: 'asc' },
            },
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video không tồn tại');
    }

    return video;
  }

  /**
   * Get subtitles for a specific episode
   */
  async getEpisodeSubtitles(episodeId: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        subtitles: { orderBy: { language: 'asc' } },
        video: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!episode) {
      throw new NotFoundException('Tập phim không tồn tại');
    }

    return episode;
  }

  /**
   * Upload SRT content directly for an episode
   */
  async uploadSubtitle(episodeId: string, dto: CreateSubtitleDto) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { video: { select: { id: true, title: true } } },
    });

    if (!episode) {
      throw new NotFoundException('Tập phim không tồn tại');
    }

    const label = dto.label || LANGUAGE_LABELS[dto.language] || dto.language;

    // Upload SRT content to R2
    const srtKey = `cdn/subtitles/${episode.videoId}/ep-${episode.episodeNumber}/${dto.language}.srt`;
    await this.r2StorageService.uploadBuffer(
      srtKey,
      Buffer.from(dto.content, 'utf-8'),
      'text/plain; charset=utf-8',
    );
    const srtUrl = this.r2StorageService.getCdnUrl(srtKey);

    // Upsert subtitle record
    const subtitle = await this.prisma.subtitle.upsert({
      where: {
        episodeId_language: { episodeId, language: dto.language },
      },
      update: {
        content: dto.content,
        srtUrl,
        label,
        isAuto: dto.isAuto ?? false,
        status: SubtitleStatus.READY,
        progress: 100,
        error: null,
      },
      create: {
        episodeId,
        language: dto.language,
        label,
        content: dto.content,
        srtUrl,
        isAuto: dto.isAuto ?? false,
        status: SubtitleStatus.READY,
        progress: 100,
      },
    });

    this.logger.log(`Subtitle uploaded: ${subtitle.id} (${dto.language}) for episode ${episodeId}`);
    return subtitle;
  }

  /**
   * Bulk upload SRT files mapped to episodes
   */
  async bulkUploadSubtitles(
    videoId: string,
    mappings: Array<{ episodeId: string; language: string; content: string }>,
  ) {
    const results = [];

    for (const mapping of mappings) {
      try {
        const result = await this.uploadSubtitle(mapping.episodeId, {
          language: mapping.language,
          content: mapping.content,
        });
        results.push({ episodeId: mapping.episodeId, success: true, subtitle: result });
      } catch (error) {
        results.push({
          episodeId: mapping.episodeId,
          success: false,
          error: (error as any)?.message || 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get a single subtitle with full content
   */
  async getSubtitle(subtitleId: string) {
    const subtitle = await this.prisma.subtitle.findUnique({
      where: { id: subtitleId },
      include: {
        episode: {
          select: {
            id: true,
            episodeNumber: true,
            title: true,
            videoId: true,
            video: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    if (!subtitle) {
      throw new NotFoundException('Phụ đề không tồn tại');
    }

    return subtitle;
  }

  /**
   * Update subtitle content (from Monaco editor)
   */
  async updateSubtitleContent(subtitleId: string, content: string) {
    const subtitle = await this.prisma.subtitle.findUnique({
      where: { id: subtitleId },
      include: { episode: { select: { videoId: true, episodeNumber: true } } },
    });

    if (!subtitle) {
      throw new NotFoundException('Phụ đề không tồn tại');
    }

    // Re-upload to R2
    const srtKey = `cdn/subtitles/${subtitle.episode.videoId}/ep-${subtitle.episode.episodeNumber}/${subtitle.language}.srt`;
    await this.r2StorageService.uploadBuffer(
      srtKey,
      Buffer.from(content, 'utf-8'),
      'text/plain; charset=utf-8',
    );

    const updated = await this.prisma.subtitle.update({
      where: { id: subtitleId },
      data: { content, updatedAt: new Date() },
    });

    this.logger.log(`Subtitle updated: ${subtitleId}`);
    return updated;
  }

  /**
   * Delete a subtitle
   */
  async deleteSubtitle(subtitleId: string) {
    const subtitle = await this.prisma.subtitle.findUnique({
      where: { id: subtitleId },
      include: { episode: { select: { videoId: true, episodeNumber: true } } },
    });

    if (!subtitle) {
      throw new NotFoundException('Phụ đề không tồn tại');
    }

    // Delete from R2
    const srtKey = `cdn/subtitles/${subtitle.episode.videoId}/ep-${subtitle.episode.episodeNumber}/${subtitle.language}.srt`;
    try {
      await this.r2StorageService.deleteObject(srtKey);
    } catch (error) {
      this.logger.warn(`Failed to delete SRT from R2: ${srtKey}`, error);
    }

    await this.prisma.subtitle.delete({ where: { id: subtitleId } });
    this.logger.log(`Subtitle deleted: ${subtitleId}`);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════════════
  // AI SUBTITLE GENERATION (Queue-based)
  // ═══════════════════════════════════════════════════════════

  /**
   * Queue an AI subtitle generation job
   * Flow: Create DB record → Push to Redis queue → Worker picks up
   */
  async generateSubtitle(episodeId: string, dto: GenerateSubtitleDto) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { video: { select: { id: true, title: true } } },
    });

    if (!episode) {
      throw new NotFoundException('Tập phim không tồn tại');
    }

    if (!episode.sourceUrl && !episode.hlsManifest) {
      throw new BadRequestException('Tập phim chưa có file video để xử lý');
    }

    // Check if already processing
    const existing = await this.prisma.subtitle.findUnique({
      where: { episodeId_language: { episodeId, language: dto.targetLanguage } },
    });

    if (existing && ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'UPLOADING'].includes(existing.status)) {
      throw new BadRequestException('Phụ đề đang được xử lý, vui lòng đợi');
    }

    const label = dto.label || LANGUAGE_LABELS[dto.targetLanguage] || dto.targetLanguage;

    // Upsert with QUEUED status
    const subtitle = await this.prisma.subtitle.upsert({
      where: {
        episodeId_language: { episodeId, language: dto.targetLanguage },
      },
      update: {
        status: SubtitleStatus.QUEUED,
        progress: 0,
        error: null,
        isAuto: true,
        label,
      },
      create: {
        episodeId,
        language: dto.targetLanguage,
        label,
        isAuto: true,
        status: SubtitleStatus.QUEUED,
        progress: 0,
      },
    });

    // Push job to Redis queue
    await this.redisService.addToQueue('subtitle-generation', {
      subtitleId: subtitle.id,
      episodeId,
      videoId: episode.videoId,
      episodeNumber: episode.episodeNumber,
      sourceUrl: episode.sourceUrl || episode.hlsManifest,
      sourceLanguage: dto.sourceLanguage || 'auto',
      targetLanguage: dto.targetLanguage,
      createdAt: new Date().toISOString(),
    });

    this.logger.log(`Subtitle generation queued: ${subtitle.id} (${dto.targetLanguage}) for episode ${episodeId}`);
    return subtitle;
  }

  /**
   * Update subtitle processing progress (called by worker)
   */
  async updateSubtitleProgress(subtitleId: string, status: SubtitleStatus, progress: number, error?: string) {
    const data: any = { status, progress };
    if (error) data.error = error;

    await this.prisma.subtitle.update({
      where: { id: subtitleId },
      data,
    });

    // Publish progress event for real-time updates
    await this.redisService.publish('subtitle-progress', {
      subtitleId,
      status,
      progress,
      error,
    });
  }

  /**
   * Complete subtitle generation (called by worker)
   */
  async completeSubtitleGeneration(subtitleId: string, content: string, srtUrl: string) {
    await this.prisma.subtitle.update({
      where: { id: subtitleId },
      data: {
        content,
        srtUrl,
        status: SubtitleStatus.COMPLETED,
        progress: 100,
        error: null,
      },
    });

    await this.redisService.publish('subtitle-progress', {
      subtitleId,
      status: 'COMPLETED',
      progress: 100,
    });

    this.logger.log(`Subtitle generation completed: ${subtitleId}`);
  }

  /**
   * Fail subtitle generation (called by worker)
   */
  async failSubtitleGeneration(subtitleId: string, error: string) {
    const truncatedError = error.length > 500 ? error.substring(0, 500) + '...' : error;

    await this.prisma.subtitle.update({
      where: { id: subtitleId },
      data: {
        status: SubtitleStatus.FAILED,
        progress: 0,
        error: truncatedError,
      },
    });

    await this.redisService.publish('subtitle-progress', {
      subtitleId,
      status: 'FAILED',
      progress: 0,
      error: truncatedError,
    });

    this.logger.error(`Subtitle generation failed: ${subtitleId} - ${truncatedError}`);
  }

  /**
   * Get subtitle queue status
   */
  async getQueueStatus() {
    const [queued, extracting, transcribing, translating, uploading, completed, failed] = await Promise.all([
      this.prisma.subtitle.count({ where: { status: SubtitleStatus.QUEUED } }),
      this.prisma.subtitle.count({ where: { status: SubtitleStatus.EXTRACTING } }),
      this.prisma.subtitle.count({ where: { status: SubtitleStatus.TRANSCRIBING } }),
      this.prisma.subtitle.count({ where: { status: SubtitleStatus.TRANSLATING } }),
      this.prisma.subtitle.count({ where: { status: SubtitleStatus.UPLOADING } }),
      this.prisma.subtitle.count({ where: { status: SubtitleStatus.COMPLETED } }),
      this.prisma.subtitle.count({ where: { status: SubtitleStatus.FAILED } }),
    ]);

    return {
      queued,
      processing: extracting + transcribing + translating + uploading,
      completed,
      failed,
      breakdown: { extracting, transcribing, translating, uploading },
    };
  }
}
