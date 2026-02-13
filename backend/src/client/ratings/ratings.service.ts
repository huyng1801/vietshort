import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async rate(userId: string, videoId: string, rating: number, review?: string) {
    if (rating < 1 || rating > 5) throw new BadRequestException('Đánh giá phải từ 1-5');

    const existing = await this.prisma.rating.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    let result;
    if (existing) {
      result = await this.prisma.rating.update({
        where: { id: existing.id },
        data: { rating },
      });
    } else {
      result = await this.prisma.rating.create({
        data: { userId, videoId, rating },
      });
    }

    // If review text provided, create/update comment separately
    if (review && review.trim()) {
      const existingComment = await this.prisma.comment.findFirst({
        where: { userId, videoId, parentId: null },
      });

      if (existingComment) {
        await this.prisma.comment.update({
          where: { id: existingComment.id },
          data: { content: review },
        });
      } else {
        await this.prisma.comment.create({
          data: { userId, videoId, content: review },
        });
      }
    }

    // Update denormalized rating
    const agg = await this.prisma.rating.aggregate({
      where: { videoId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.video.update({
      where: { id: videoId },
      data: { ratingAverage: agg._avg.rating || 0, ratingCount: agg._count.rating },
    });

    return result;
  }

  async getUserRating(userId: string, videoId: string) {
    return this.prisma.rating.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });
  }

  async getVideoRatings(videoId: string, page = 1, limit = 20) {
    return this.prisma.paginate('rating', {
      page, limit,
      where: { videoId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });
  }
}
