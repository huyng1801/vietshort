import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { HlsStreamingService } from './services/hls-streaming.service';
import { CreateVideoDto, UpdateVideoDto, QueryVideoDto, CreateEpisodeDto } from './dto/video.dto';
import { VideoStatus, VipType } from '@prisma/client';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private hlsStreamingService: HlsStreamingService,
  ) {}

  // ─── Videos CRUD ──────────────────────────────────────
  async create(dto: CreateVideoDto) {
    const slug = await this.generateSlug(dto.title);
    return this.prisma.video.create({
      data: { ...dto, slug },
      include: { episodes: true },
    });
  }

  async update(id: string, dto: UpdateVideoDto) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    const updated = await this.prisma.video.update({
      where: { id },
      data: { ...dto, publishedAt: dto.status === VideoStatus.PUBLISHED && !video.publishedAt ? new Date() : undefined },
      include: { episodes: true },
    });
    await this.redisService.del(`video:${id}`);
    await this.redisService.del(`video:slug:${video.slug}`);
    return updated;
  }

  async findById(id: string) {
    const cached = await this.redisService.get(`video:${id}`);
    if (cached) return cached;

    const video = await this.prisma.video.findUnique({
      where: { id },
      include: { episodes: { orderBy: { episodeNumber: 'asc' } } },
    });
    if (!video) throw new NotFoundException('Video không tồn tại');

    await this.redisService.set(`video:${id}`, video, 300);
    return video;
  }

  async findBySlug(slug: string) {
    const cached = await this.redisService.get(`video:slug:${slug}`);
    if (cached) return cached;

    const video = await this.prisma.video.findUnique({
      where: { slug },
      include: { episodes: { orderBy: { episodeNumber: 'asc' } } },
    });
    if (!video) throw new NotFoundException('Video không tồn tại');

    await this.redisService.set(`video:slug:${slug}`, video, 300);
    return video;
  }

  async findAll(query: QueryVideoDto) {
    const { search, page = 1, limit = 20, status, genre, country, isVipOnly, sort = 'createdAt', order = 'desc' } = query;
    const where: any = {};

    if (status) where.status = status;
    else where.status = VideoStatus.PUBLISHED;
    if (genre) where.genres = { contains: genre };
    if (country) where.country = country;
    if (isVipOnly !== undefined) where.isVipOnly = isVipOnly;
    if (search) where.OR = [{ title: { contains: search } }, { description: { contains: search } }];

    return this.prisma.paginate('video', {
      page, limit, where,
      orderBy: { [sort]: order },
      include: { _count: { select: { episodes: true, comments: true } } },
    });
  }

  async getGenres() {
    const cacheKey = 'genres:active';
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const genres = await this.prisma.genre.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, description: true },
    });

    await this.redisService.set(cacheKey, genres, 3600);
    return genres;
  }

  async getTrending(limit = 20) {
    const cacheKey = `trending:${limit}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const videos = await this.prisma.video.findMany({
      where: { status: VideoStatus.PUBLISHED },
      orderBy: [{ viewCount: 'desc' }, { ratingAverage: 'desc' }],
      take: limit,
      select: {
        id: true, title: true, slug: true, poster: true,
        viewCount: true, likeCount: true, ratingAverage: true, isVipOnly: true,
        releaseYear: true, genres: true, duration: true,
        isSerial: true, totalEpisodes: true,
      },
    });

    await this.redisService.set(cacheKey, videos, 600);
    return videos;
  }

  async getNewReleases(limit = 20) {
    return this.prisma.video.findMany({
      where: { status: VideoStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true, title: true, slug: true, poster: true,
        viewCount: true, ratingAverage: true, isVipOnly: true, publishedAt: true,
        releaseYear: true, genres: true, duration: true,
        isSerial: true, totalEpisodes: true,
      },
    });
  }

  async incrementViewCount(id: string) {
    await this.prisma.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  // ─── Episodes ─────────────────────────────────────────
  async createEpisode(dto: CreateEpisodeDto) {
    return this.prisma.episode.create({ data: dto });
  }

  async getEpisode(episodeId: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { video: { select: { id: true, title: true, isVipOnly: true } }, subtitles: true },
    });
    if (!episode) throw new NotFoundException('Tập phim không tồn tại');
    return episode;
  }

  // ─── Watch History ────────────────────────────────────
  async updateWatchProgress(userId: string | null, videoId: string, episodeId: string | null, progressive: number, deviceId?: string) {
    const where = userId
      ? { userId, videoId, episodeId }
      : { deviceId, videoId, episodeId };

    const existing = await this.prisma.watchHistory.findFirst({ where: where as any });

    if (existing) {
      return this.prisma.watchHistory.update({
        where: { id: existing.id },
        data: { progressive, watchTime: { increment: 30 }, isCompleted: progressive > 0.95 },
      });
    }

    return this.prisma.watchHistory.create({
      data: { userId, deviceId, videoId, episodeId, progressive, watchTime: 30 },
    });
  }

  // ─── Helpers ──────────────────────────────────────────
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

  // ─── Access Control ───────────────────────────────────
  /**
   * Kiểm tra quyền truy cập video/episode dựa trên VIP status và unlock history
   */
  async checkEpisodeAccess(
    userId: string | null,
    episodeId: string,
    userVipTier?: VipType | null,
    userVipExpiresAt?: Date | null,
  ): Promise<{ hasAccess: boolean; reason?: string; unlockPrice?: number }> {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { video: { select: { isVipOnly: true, vipTier: true, unlockPrice: true } } },
    });
    if (!episode) throw new NotFoundException('Tập phim không tồn tại');

    // Tập miễn phí → luôn cho phép (unlockPrice is null = free)
    if (episode.unlockPrice === null) return { hasAccess: true };

    // Kiểm tra VIP access
    const now = new Date();
    const isVipActive = userVipExpiresAt && userVipExpiresAt > now;
    const effectiveVipType = isVipActive ? userVipTier : null;

    if (episode.video.isVipOnly) {
      const requiredTier = episode.video.vipTier;
      // VIP_GOLD: chỉ VIP Gold mới xem được
      if (requiredTier === VipType.VIP_GOLD && effectiveVipType === VipType.VIP_GOLD) {
        return { hasAccess: true };
      }
      // VIP_FREEADS: VIP FreeAds hoặc VIP Gold đều xem được
      if (requiredTier === VipType.VIP_FREEADS && (effectiveVipType === VipType.VIP_GOLD || effectiveVipType === VipType.VIP_FREEADS)) {
        return { hasAccess: true };
      }
      // Không chỉ định tier cụ thể → bất kỳ VIP nào đều xem được
      if (!requiredTier && effectiveVipType !== null) {
        return { hasAccess: true };
      }
    }

    // Kiểm tra đã unlock bằng gold/ad chưa
    if (userId) {
      const unlock = await this.prisma.videoUnlock.findUnique({
        where: { userId_episodeId: { userId, episodeId } },
      });
      if (unlock) return { hasAccess: true };
    }

    // Không có quyền truy cập
    const price = episode.unlockPrice ?? episode.video.unlockPrice ?? 0;
    return {
      hasAccess: false,
      reason: episode.video.isVipOnly
        ? 'Nội dung này dành cho VIP. Nâng cấp VIP hoặc mở khóa bằng gold.'
        : 'Vui lòng mở khóa tập phim bằng gold hoặc xem quảng cáo.',
      unlockPrice: price,
    };
  }

  // ─── Streaming ────────────────────────────────────────
  /**
   * Tạo signed streaming URL cho episode (sau khi đã check access)
   */
  async getStreamingUrl(
    episodeId: string,
    userId: string | null,
    userVipTier?: VipType | null,
    userVipExpiresAt?: Date | null,
  ): Promise<{ manifestUrl: string; qualities: string[] }> {
    const access = await this.checkEpisodeAccess(userId, episodeId, userVipTier, userVipExpiresAt);
    if (!access.hasAccess) {
      throw new ForbiddenException(access.reason);
    }

    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      select: { hlsManifest: true, encodingStatus: true },
    });
    if (!episode) throw new NotFoundException('Tập phim không tồn tại');
    if (episode.encodingStatus !== 'COMPLETED') {
      throw new ForbiddenException('Tập phim đang được xử lý, vui lòng thử lại sau');
    }

    // Xác định chất lượng dựa trên VIP level
    const now = new Date();
    const isVipActive = userVipExpiresAt && userVipExpiresAt > now;
    const effectiveVip = isVipActive ? userVipTier : null;

    let qualities: string[];
    switch (effectiveVip) {
      case VipType.VIP_GOLD:
        qualities = ['540p', '720p', '1080p'];
        break;
      case VipType.VIP_FREEADS:
        qualities = ['540p', '720p'];
        break;
      default:
        qualities = ['540p'];
        break;
    }

    // Generate signed manifest URL (1h expiry)
    const manifestUrl = this.hlsStreamingService.generateSignedUrl(
      `videos/${episodeId}/master.m3u8`,
      3600,
    );

    return { manifestUrl, qualities };
  }
}
