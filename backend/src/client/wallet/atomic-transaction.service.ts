import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class AtomicTransactionService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async executeWithLock<T>(key: string, fn: () => Promise<T>, ttl = 10): Promise<T> {
    const lockKey = `wallet_lock:${key}`;
    const acquired = await this.redisService.acquireLock(lockKey, ttl);
    if (!acquired) throw new BadRequestException('Giao dịch đang xử lý, vui lòng thử lại');

    try {
      return await fn();
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }

  async atomicTransfer(fromUserId: string, toUserId: string, amount: number, description: string) {
    return this.executeWithLock(`transfer:${fromUserId}:${toUserId}`, async () => {
      return this.prisma.$transaction(async (tx) => {
        const fromUser = await tx.user.findUnique({ where: { id: fromUserId } });
        if (!fromUser || fromUser.goldBalance < amount) throw new BadRequestException('Số dư không đủ');

        await tx.user.update({ where: { id: fromUserId }, data: { goldBalance: { decrement: amount } } });
        await tx.user.update({ where: { id: toUserId }, data: { goldBalance: { increment: amount } } });

        return { success: true, amount, description };
      });
    });
  }
}
