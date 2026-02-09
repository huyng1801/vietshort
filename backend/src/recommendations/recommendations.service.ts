import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getRecommendations(userId: string, limit = 20) {
    const cacheKey = `recommendations:${userId}`;
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) return cached;

    // Content-based: find videos similar to user's watched/liked content
    const userHistory = await this.prisma.watchHistory.findMany({
      where: { userId },
      select: { videoId: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const watchedIds = userHistory.map(h => h.videoId);

    // Collaborative: popular among similar users
    const recommendations = await this.prisma.video.findMany({
      where: {
        id: { notIn: watchedIds },
        status: 'PUBLISHED',
      },
      orderBy: [
        { viewCount: 'desc' },
        { ratingAverage: 'desc' },
      ],
      take: limit,
      select: {
        id: true, title: true, slug: true, poster: true, duration: true,
        viewCount: true, ratingAverage: true, genres: true, ageRating: true,
      },
    });

    await this.redisService.set(cacheKey, JSON.stringify(recommendations), 1800); // 30 min cache
    return recommendations;
  }

  async getSimilarVideos(videoId: string, limit = 10) {
    const cacheKey = `similar:${videoId}`;
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) return cached;

    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { genres: true, country: true },
    });
    if (!video) return [];

    const similar = await this.prisma.video.findMany({
      where: {
        id: { not: videoId },
        status: 'PUBLISHED',
        OR: [
          { genres: video.genres },
          { country: video.country },
        ],
      },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true, title: true, slug: true, poster: true,
        duration: true, viewCount: true, ratingAverage: true,
      },
    });

    await this.redisService.set(cacheKey, JSON.stringify(similar), 3600);
    return similar;
  }
}
