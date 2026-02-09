import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';
import { VideoStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async search(query: string, page = 1, limit = 20) {
    const cacheKey = `search:${query}:${page}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const where: any = {
      status: VideoStatus.PUBLISHED,
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { director: { contains: query } },
        { actors: { contains: query } },
      ],
    };

    const result = await this.prisma.paginate('video', {
      page, limit, where,
      orderBy: { viewCount: 'desc' },
    });

    await this.redisService.set(cacheKey, result, 300);
    return result;
  }

  async suggest(query: string, limit = 10) {
    if (!query || query.length < 2) return [];
    return this.prisma.video.findMany({
      where: {
        status: VideoStatus.PUBLISHED,
        title: { contains: query },
      },
      select: { id: true, title: true, slug: true, poster: true },
      take: limit,
      orderBy: { viewCount: 'desc' },
    });
  }
}
