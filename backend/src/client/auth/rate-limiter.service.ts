import { Injectable } from '@nestjs/common';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class RateLimiterService {
  private readonly maxAttempts = 5;
  private readonly windowSeconds = 900; // 15 minutes

  constructor(private redisService: RedisService) {}

  async checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
    const key = `login_attempts:${identifier}`;
    const attempts = await this.redisService.getRateLimit(key);

    if (attempts >= this.maxAttempts) {
      const ttl = await this.redisService.getClient().ttl(key);
      return { allowed: false, remaining: 0, retryAfter: ttl > 0 ? ttl : this.windowSeconds };
    }

    return { allowed: true, remaining: this.maxAttempts - attempts };
  }

  async recordFailedAttempt(identifier: string): Promise<number> {
    const key = `login_attempts:${identifier}`;
    return this.redisService.incrementRateLimit(key, this.windowSeconds);
  }

  async resetAttempts(identifier: string): Promise<void> {
    const key = `login_attempts:${identifier}`;
    await this.redisService.del(key);
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    return this.redisService.exists(`account_locked:${userId}`);
  }

  async lockAccount(userId: string, duration = 1800): Promise<void> {
    await this.redisService.set(`account_locked:${userId}`, true, duration);
  }

  async unlockAccount(userId: string): Promise<void> {
    await this.redisService.del(`account_locked:${userId}`);
  }
}
