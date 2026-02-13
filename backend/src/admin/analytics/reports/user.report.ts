import { PrismaService } from '../../../config/database.config';

export class UserReport {
  constructor(private prisma: PrismaService) {}

  async getUserGrowth(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const daily: Record<string, number> = {};
    users.forEach((u) => {
      const date = u.createdAt.toISOString().split('T')[0];
      daily[date] = (daily[date] || 0) + 1;
    });

    return daily;
  }

  async getVipDistribution() {
    return this.prisma.user.groupBy({
      by: ['vipTier'],
      _count: true,
    });
  }

  async getActiveUsers(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.user.count({
      where: { lastLoginAt: { gte: since } },
    });
  }

  async getRetentionRate(cohortDate: Date) {
    const cohortEnd = new Date(cohortDate);
    cohortEnd.setDate(cohortEnd.getDate() + 1);

    const cohort = await this.prisma.user.count({
      where: { createdAt: { gte: cohortDate, lt: cohortEnd } },
    });

    const sevenDayLater = new Date(cohortDate);
    sevenDayLater.setDate(sevenDayLater.getDate() + 7);

    const retained = await this.prisma.user.count({
      where: { createdAt: { gte: cohortDate, lt: cohortEnd }, lastLoginAt: { gte: sevenDayLater } },
    });

    return { cohort, retained, rate: cohort > 0 ? retained / cohort : 0 };
  }
}
