import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getOverview(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [users, videos, transactions, views] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.video.count({ where: { createdAt: { gte: since } } }),
      this.prisma.transaction.count({ where: { createdAt: { gte: since }, status: 'COMPLETED' } }),
      this.prisma.video.aggregate({ _sum: { viewCount: true } }),
    ]);

    return { newUsers: users, newVideos: videos, completedTransactions: transactions, totalViews: views._sum.viewCount || 0 };
  }

  async getRevenueReport(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const transactions = await this.prisma.transaction.groupBy({
      by: ['provider'],
      where: { createdAt: { gte: since }, status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true,
    });

    const total = transactions.reduce((sum, t) => sum + (t._sum.amount || 0), 0);
    return { total, byProvider: transactions, period: `${days} days` };
  }

  async getTopVideos(limit = 10) {
    return this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: { id: true, title: true, viewCount: true, likeCount: true, ratingAverage: true, createdAt: true },
    });
  }

  async getUserGrowth(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const users = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { createdAt: 'asc' },
    });

    return users;
  }
}
