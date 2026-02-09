import { PrismaService } from '../../config/database.config';

export class RevenueReport {
  constructor(private prisma: PrismaService) {}

  async getRevenueByProvider(startDate: Date, endDate: Date) {
    return this.prisma.transaction.groupBy({
      by: ['provider'],
      where: { status: 'COMPLETED', processedAt: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true,
    });
  }

  async getRevenueByType(startDate: Date, endDate: Date) {
    return this.prisma.transaction.groupBy({
      by: ['type'],
      where: { status: 'COMPLETED', processedAt: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true,
    });
  }

  async getDailyRevenue(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const transactions = await this.prisma.transaction.findMany({
      where: { status: 'COMPLETED', processedAt: { gte: since } },
      select: { amount: true, processedAt: true },
      orderBy: { processedAt: 'asc' },
    });

    const daily: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.processedAt) {
        const date = tx.processedAt.toISOString().split('T')[0];
        daily[date] = (daily[date] || 0) + tx.amount;
      }
    });

    return daily;
  }
}
