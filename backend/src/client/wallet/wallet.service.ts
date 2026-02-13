import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { goldBalance: true, vipTier: true, vipExpiresAt: true },
    });
    return user;
  }

  /**
   * Spend gold with optimistic locking to prevent race conditions
   */
  async spendGold(userId: string, amount: number, description: string, referenceId?: string) {
    const lockKey = `wallet:${userId}`;
    const acquired = await this.redisService.acquireLock(lockKey, 10);
    if (!acquired) throw new BadRequestException('Giao dịch đang xử lý, vui lòng thử lại');

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.goldBalance < amount) {
        throw new BadRequestException('Số dư không đủ');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id: userId, goldBalance: { gte: amount } },
          data: { goldBalance: { decrement: amount } },
        });

        const transaction = await tx.transaction.create({
          data: {
            userId, type: TransactionType.SPEND_GOLD,
            amount: 0, rewardValue: -amount,
            description, referenceId,
            status: TransactionStatus.COMPLETED,
            processedAt: new Date(),
          },
        });

        return { balance: updated.goldBalance, transaction };
      });

      await this.redisService.del(`user:${userId}`);
      return result;
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }

  async addGold(userId: string, amount: number, description: string, referenceId?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { goldBalance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          userId, type: TransactionType.ADMIN_ADJUST,
          amount: 0, rewardValue: amount,
          description, referenceId,
          status: TransactionStatus.COMPLETED,
          processedAt: new Date(),
        },
      });

      return { balance: updated.goldBalance };
    });

    await this.redisService.del(`user:${userId}`);
    return result;
  }
}
