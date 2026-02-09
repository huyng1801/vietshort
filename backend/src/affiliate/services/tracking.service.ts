import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class TrackingService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async trackReferral(referralCode: string, userId: string, ip: string) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { referralCode } });
    if (!affiliate || !affiliate.isActive) return null;

    // Fraud detection: IP rate limiting
    const ipKey = `referral_ip:${ip}`;
    const ipCount = await this.redisService.get<number>(ipKey);
    if (ipCount && Number(ipCount) > 5) return null;
    await this.redisService.incrementRateLimit(ipKey, 86400);

    // Duplicate check
    const exists = await this.prisma.ctvReferral.findFirst({
      where: { affiliateId: affiliate.id, userId },
    });
    if (exists) return null;

    return this.prisma.ctvReferral.create({
      data: { affiliateId: affiliate.id, userId, ipAddress: ip, registeredAt: new Date() },
    });
  }

  async trackClick(referralCode: string, ip: string) {
    const key = `clicks:${referralCode}:${new Date().toISOString().split('T')[0]}`;
    await this.redisService.incrementRateLimit(key, 86400);
  }

  async getClickStats(referralCode: string, days = 30) {
    const stats: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = `clicks:${referralCode}:${date.toISOString().split('T')[0]}`;
      const count = await this.redisService.get<number>(key);
      stats[date.toISOString().split('T')[0]] = count ? Number(count) : 0;
    }
    return stats;
  }

  async getConversionRate(affiliateId: string) {
    const referrals = await this.prisma.ctvReferral.count({ where: { affiliateId } });
    const conversions = await this.prisma.ctvReferral.count({
      where: { affiliateId, firstPurchaseAt: { not: null } },
    });
    return { referrals, conversions, rate: referrals > 0 ? conversions / referrals : 0 };
  }
}
