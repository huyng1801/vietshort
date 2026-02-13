import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionIntegrityService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async ensureIdempotency(transactionId: string): Promise<boolean> {
    const key = `tx_processed:${transactionId}`;
    const exists = await this.redisService.exists(key);
    if (exists) return false; // Already processed
    await this.redisService.set(key, '1', 86400 * 7); // 7 day TTL
    return true;
  }

  async executeAtomicTransaction<T>(
    fn: (tx: any) => Promise<T>,
    lockKey: string,
    lockTtl = 30,
  ): Promise<T> {
    const acquired = await this.redisService.acquireLock(lockKey, lockTtl);
    if (!acquired) throw new BadRequestException('Giao dịch đang xử lý, vui lòng thử lại');

    try {
      return await this.prisma.$transaction(fn);
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }

  async verifyTransactionState(transactionId: string): Promise<boolean> {
    const tx = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    return tx?.status === TransactionStatus.PENDING;
  }

  async reconcileTransaction(transactionId: string, providerStatus: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!tx) return null;

    const isConsistent = (
      (providerStatus === 'success' && tx.status === TransactionStatus.COMPLETED) ||
      (providerStatus === 'failed' && tx.status === TransactionStatus.FAILED)
    );

    return { transactionId, dbStatus: tx.status, providerStatus, isConsistent };
  }
}
