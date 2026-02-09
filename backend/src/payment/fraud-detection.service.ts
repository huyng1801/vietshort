import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../config/redis.config';

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  constructor(private redisService: RedisService) {}

  async checkSuspiciousActivity(userId: string, amount: number, ip: string): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // Check rapid transactions
    const txCountKey = `fraud:tx_count:${userId}`;
    const txCount = await this.redisService.incrementRateLimit(txCountKey, 3600);
    if (txCount > 10) reasons.push('Quá nhiều giao dịch trong 1 giờ');

    // Check large amounts
    if (amount > 5000000) reasons.push('Giao dịch giá trị cao');

    // Check multiple IPs
    const ipKey = `fraud:ip:${userId}`;
    const ipCount = await this.redisService.incrementRateLimit(ipKey, 86400);
    if (ipCount > 5) reasons.push('Nhiều địa chỉ IP khác nhau');

    // Check blacklisted IPs
    const blacklisted = await this.redisService.exists(`blacklist_ip:${ip}`);
    if (blacklisted) reasons.push('IP đã bị đánh dấu');

    if (reasons.length > 0) {
      this.logger.warn(`Suspicious activity for user ${userId}: ${reasons.join(', ')}`);
    }

    return { suspicious: reasons.length > 0, reasons };
  }

  async flagTransaction(transactionId: string, reason: string): Promise<void> {
    await this.redisService.set(`flagged_tx:${transactionId}`, reason, 86400 * 30);
  }

  async blacklistIp(ip: string, duration = 86400 * 30): Promise<void> {
    await this.redisService.set(`blacklist_ip:${ip}`, '1', duration);
  }
}
