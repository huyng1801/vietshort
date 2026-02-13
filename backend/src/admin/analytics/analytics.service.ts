import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  // ─── Helper: Generate date range array ────────────────
  private generateDateRange(days: number): string[] {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

  private getSinceDate(days: number): Date {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);
    return since;
  }

  // ─── Overview ────────────────────────────────────────
  async getOverview(days = 30) {
    const since = this.getSinceDate(days);

    const [users, videos, transactions, views, totalUsers, totalVideos, activeVip] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.video.count({ where: { createdAt: { gte: since } } }),
      this.prisma.transaction.count({ where: { createdAt: { gte: since }, status: 'COMPLETED' } }),
      this.prisma.video.aggregate({ _sum: { viewCount: true } }),
      this.prisma.user.count(),
      this.prisma.video.count(),
      this.prisma.user.count({ where: { vipTier: { not: null }, vipExpiresAt: { gt: new Date() } } }),
    ]);

    return {
      newUsers: users,
      newVideos: videos,
      completedTransactions: transactions,
      totalViews: views._sum.viewCount || 0,
      totalUsers,
      totalVideos,
      activeVipUsers: activeVip,
    };
  }

  // ─── Views Report (chart-ready) ──────────────────────
  async getViewsReport(days = 30) {
    const since = this.getSinceDate(days);
    const dateRange = this.generateDateRange(days);

    // Get watch history grouped by date
    const watchData = await this.prisma.watchHistory.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const dailyViews: Record<string, number> = {};
    watchData.forEach((w) => {
      const date = w.createdAt.toISOString().split('T')[0];
      dailyViews[date] = (dailyViews[date] || 0) + 1;
    });

    // Get top videos by views in this period
    const topVideos = await this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: { id: true, title: true, poster: true, viewCount: true, likeCount: true },
    });

    const totalViews = await this.prisma.video.aggregate({ _sum: { viewCount: true } });

    return {
      chart: dateRange.map((date) => ({ date, views: dailyViews[date] || 0 })),
      topVideos: topVideos.map((v) => ({
        title: v.title,
        views: v.viewCount,
      })),
      totalViews: totalViews._sum.viewCount || 0,
    };
  }

  // ─── Revenue Report (chart-ready with provider breakdown) ─
  async getRevenueReport(days = 30) {
    const since = this.getSinceDate(days);
    const dateRange = this.generateDateRange(days);

    const transactions = await this.prisma.transaction.findMany({
      where: { createdAt: { gte: since }, status: 'COMPLETED' },
      select: { amount: true, provider: true, createdAt: true },
    });

    // Group by date + provider
    const daily: Record<string, { vnpay: number; momo: number; iap: number; total: number }> = {};
    dateRange.forEach((d) => {
      daily[d] = { vnpay: 0, momo: 0, iap: 0, total: 0 };
    });

    transactions.forEach((tx) => {
      const date = tx.createdAt.toISOString().split('T')[0];
      if (!daily[date]) daily[date] = { vnpay: 0, momo: 0, iap: 0, total: 0 };
      const provider = (tx.provider || 'other').toLowerCase();
      if (provider === 'vnpay') daily[date].vnpay += tx.amount;
      else if (provider === 'momo') daily[date].momo += tx.amount;
      else daily[date].iap += tx.amount;
      daily[date].total += tx.amount;
    });

    // Provider totals
    const byProvider = transactions.reduce(
      (acc, tx) => {
        const p = (tx.provider || 'other').toLowerCase();
        if (p === 'vnpay') acc.vnpay += tx.amount;
        else if (p === 'momo') acc.momo += tx.amount;
        else acc.iap += tx.amount;
        acc.total += tx.amount;
        return acc;
      },
      { vnpay: 0, momo: 0, iap: 0, total: 0 },
    );

    return {
      chart: dateRange.map((date) => ({ date, ...daily[date] })),
      byProvider,
      transactionCount: transactions.length,
    };
  }

  // ─── Users Report (chart-ready) ──────────────────────
  async getUsersReport(days = 30) {
    const since = this.getSinceDate(days);
    const dateRange = this.generateDateRange(days);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyNew: Record<string, number> = {};
    users.forEach((u) => {
      const date = u.createdAt.toISOString().split('T')[0];
      dailyNew[date] = (dailyNew[date] || 0) + 1;
    });

    // Calculate cumulative total
    const totalBefore = await this.prisma.user.count({ where: { createdAt: { lt: since } } });
    let cumulative = totalBefore;

    // VIP distribution
    const vipDistribution = await this.prisma.user.groupBy({
      by: ['vipTier'],
      _count: true,
    });

    // Active users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await this.prisma.user.count({
      where: { lastLoginAt: { gte: sevenDaysAgo } },
    });

    const totalUsers = await this.prisma.user.count();

    return {
      chart: dateRange.map((date) => {
        const newUsers = dailyNew[date] || 0;
        cumulative += newUsers;
        return { date, newUsers, totalUsers: cumulative };
      }),
      vipDistribution: vipDistribution.map((v) => ({
        tier: v.vipTier || 'FREE',
        count: v._count,
      })),
      activeUsers,
      totalUsers,
      newUsersInPeriod: users.length,
    };
  }

  // ─── Top Videos ──────────────────────────────────────
  async getTopVideos(limit = 10) {
    return this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        poster: true,
        viewCount: true,
        likeCount: true,
        ratingAverage: true,
        createdAt: true,
      },
    });
  }

  // ─── User Growth (legacy) ────────────────────────────
  async getUserGrowth(days = 30) {
    const since = this.getSinceDate(days);
    const dateRange = this.generateDateRange(days);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyNew: Record<string, number> = {};
    users.forEach((u) => {
      const date = u.createdAt.toISOString().split('T')[0];
      dailyNew[date] = (dailyNew[date] || 0) + 1;
    });

    const totalBefore = await this.prisma.user.count({ where: { createdAt: { lt: since } } });
    let cumulative = totalBefore;

    return dateRange.map((date) => {
      const newUsers = dailyNew[date] || 0;
      cumulative += newUsers;
      return { date, newUsers, totalUsers: cumulative };
    });
  }
}
