import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(private prisma: PrismaService) {}

  async reconcilePendingTransactions(olderThanMinutes = 30) {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - olderThanMinutes);

    const staleTransactions = await this.prisma.transaction.findMany({
      where: { status: TransactionStatus.PENDING, createdAt: { lt: cutoff } },
    });

    const results = [];
    for (const tx of staleTransactions) {
      try {
        await this.prisma.transaction.update({
          where: { id: tx.id },
          data: { status: TransactionStatus.FAILED, processedAt: new Date() },
        });
        results.push({ id: tx.id, action: 'marked_failed' });
      } catch (error) {
        this.logger.error(`Failed to reconcile transaction ${tx.id}:`, error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({ id: tx.id, action: 'error', error: errorMsg });
      }
    }

    return { processed: results.length, results };
  }

  async getDailyReconciliation(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const [completed, failed, pending] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { status: TransactionStatus.COMPLETED, processedAt: { gte: start, lte: end } },
        _sum: { amount: true }, _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { status: TransactionStatus.FAILED, processedAt: { gte: start, lte: end } },
        _sum: { amount: true }, _count: true,
      }),
      this.prisma.transaction.count({
        where: { status: TransactionStatus.PENDING, createdAt: { gte: start, lte: end } },
      }),
    ]);

    return {
      date: date.toISOString().split('T')[0],
      completed: { count: completed._count, amount: completed._sum.amount || 0 },
      failed: { count: failed._count, amount: failed._sum.amount || 0 },
      pending,
    };
  }
}
