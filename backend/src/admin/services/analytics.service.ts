import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getRevenueOverview(startDate: Date, endDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        processedAt: { gte: startDate, lte: endDate },
      },
      select: { amount: true, provider: true, type: true, processedAt: true },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const byProvider = transactions.reduce((acc, t) => {
      if (t.provider) {
        acc[t.provider as string] = (acc[t.provider as string] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, byProvider, transactionCount: transactions.length };
  }

  async getUserGrowth(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const users = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: since } },
      _count: true,
    });

    return users;
  }

  async getContentStats() {
    const [totalVideos, publishedVideos, draftVideos] = await Promise.all([
      this.prisma.video.count(),
      this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.video.count({ where: { status: 'DRAFT' } }),
    ]);

    return { totalVideos, publishedVideos, draftVideos };
  }
}
