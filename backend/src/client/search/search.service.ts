import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { VideoStatus } from '@prisma/client';

export interface SearchOptions {
  genre?: string;
  sort?: 'relevance' | 'newest' | 'views' | 'rating';
  year?: string;
  quality?: string;
}

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async search(query: string, page = 1, limit = 20, options: SearchOptions = {}) {
    const { genre, sort = 'relevance', year, quality } = options;

    const cacheKey = `search:${query}:${genre}:${sort}:${year}:${quality}:${page}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const where: any = { status: VideoStatus.PUBLISHED };

    // Keyword search - only add if query is provided
    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { director: { contains: query } },
        { actors: { contains: query } },
      ];
    }

    // Genre filter
    if (genre) {
      where.genres = { contains: genre };
    }

    // Year filter (supports single year "2025" or range "2021-2020")
    if (year) {
      if (year.includes('-')) {
        const parts = year.split('-').map(Number).filter(Boolean).sort((a, b) => b - a);
        if (parts.length === 2) {
          where.releaseYear = { gte: parts[1], lte: parts[0] };
        }
      } else {
        const y = parseInt(year, 10);
        if (!isNaN(y)) where.releaseYear = y;
      }
    }

    // Sort order
    let orderBy: any = { viewCount: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'views') orderBy = { viewCount: 'desc' };
    else if (sort === 'rating') orderBy = { ratingAverage: 'desc' };
    else if (sort === 'relevance' && query?.trim()) orderBy = { viewCount: 'desc' };

    const result = await this.prisma.paginate('video', {
      page,
      limit,
      where,
      orderBy,
    });

    // Cache for 5 min, but shorter (1 min) for keyword searches
    const ttl = query?.trim() ? 60 : 300;
    await this.redisService.set(cacheKey, result, ttl);
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
