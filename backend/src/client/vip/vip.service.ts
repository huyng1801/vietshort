import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { VipType } from '@prisma/client';

@Injectable()
export class VipService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getVipStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { vipTier: true, vipExpiresAt: true },
    });
    const isActive = user?.vipTier !== null && user?.vipExpiresAt && user.vipExpiresAt > new Date();
    return { ...user, isActive };
  }

  async getVipPlans() {
    // Get VIP plans from database with cache
    const cacheKey = 'vip_plans:active';
    let plans = await this.redisService.get<any[]>(cacheKey);

    if (!plans) {
      const dbPlans = await this.prisma.vipPlan.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      // Map database fields to API response format
      plans = dbPlans.map(plan => ({
        id: plan.id,
        type: plan.vipType,
        days: plan.durationDays,
        price: plan.priceVnd,
        goldPrice: Math.round(plan.priceVnd / 100), // 100 VND = 1 gold
        name: plan.name,
        discount: plan.discount,
        description: plan.description,
      }));

      await this.redisService.set(cacheKey, plans, 3600); // Cache 1 hour
    }

    return plans;
  }

  async activateVip(userId: string, vipTier: VipType, days: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const now = new Date();
    const currentExpiry = user?.vipExpiresAt && user.vipExpiresAt > now ? user.vipExpiresAt : now;
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + days);

    return this.prisma.user.update({
      where: { id: userId },
      data: { vipTier, vipExpiresAt: newExpiry },
    });
  }

  async checkExpiredVip() {
    const result = await this.prisma.user.updateMany({
      where: { vipTier: { not: null }, vipExpiresAt: { lt: new Date() } },
      data: { vipTier: null },
    });
    return result.count;
  }
}
