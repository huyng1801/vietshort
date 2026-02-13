import { Injectable }from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class BalanceProtectionService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async verifyBalance(userId: string, amount: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { goldBalance: true },
    });
    return user ? user.goldBalance >= amount : false;
  }

  async getBalanceWithLock(userId: string): Promise<number> {
    const lockKey = `balance_check:${userId}`;
    const acquired = await this.redisService.acquireLock(lockKey, 5);
    if (!acquired) return -1;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { goldBalance: true },
      });
      return user?.goldBalance || 0;
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }

  async detectConcurrentAccess(userId: string): Promise<boolean> {
    const key = `concurrent:${userId}`;
    const count = await this.redisService.incrementRateLimit(key, 5);
    return count > 3; // More than 3 requests in 5 seconds
  }
}
