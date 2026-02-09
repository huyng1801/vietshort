import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { VipType } from '@prisma/client';

@Injectable()
export class VipService {
  constructor(private prisma: PrismaService) {}

  async getVipStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { vipTier: true, vipExpiresAt: true },
    });
    const isActive = user?.vipTier !== null && user?.vipExpiresAt && user.vipExpiresAt > new Date();
    return { ...user, isActive };
  }

  async getVipPlans() {
    // README: VIP FreeAds (19k/49k/179k) + VIP Gold (49k/129k/469k)
    return [
      // VIP FreeAds plans
      { id: 'freeads_30', type: VipType.VIP_FREEADS, days: 30, price: 19000, goldPrice: 190, name: 'VIP FreeAds 1 tháng', discount: null },
      { id: 'freeads_90', type: VipType.VIP_FREEADS, days: 90, price: 49000, goldPrice: 490, name: 'VIP FreeAds 3 tháng', discount: 0.14 },
      { id: 'freeads_365', type: VipType.VIP_FREEADS, days: 365, price: 179000, goldPrice: 1790, name: 'VIP FreeAds 1 năm', discount: 0.22 },
      // VIP Gold plans
      { id: 'gold_30', type: VipType.VIP_GOLD, days: 30, price: 49000, goldPrice: 490, name: 'VIP Gold 1 tháng', discount: null },
      { id: 'gold_90', type: VipType.VIP_GOLD, days: 90, price: 129000, goldPrice: 1290, name: 'VIP Gold 3 tháng', discount: 0.12 },
      { id: 'gold_365', type: VipType.VIP_GOLD, days: 365, price: 469000, goldPrice: 4690, name: 'VIP Gold 1 năm', discount: 0.20 },
    ];
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
