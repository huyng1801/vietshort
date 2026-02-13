import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async toggleFavorite(userId: string, videoId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      await this.prisma.video.update({ where: { id: videoId }, data: { likeCount: { decrement: 1 } } });
      return { liked: false };
    }

    await this.prisma.favorite.create({ data: { userId, videoId } });
    await this.prisma.video.update({ where: { id: videoId }, data: { likeCount: { increment: 1 } } });
    return { liked: true };
  }

  async isLiked(userId: string, videoId: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });
    return { liked: !!fav };
  }

  async getUserLikes(userId: string, page = 1, limit = 20) {
    return this.prisma.paginate('favorite', {
      page, limit,
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { video: { select: { id: true, title: true, slug: true, poster: true, viewCount: true } } },
    });
  }
}
