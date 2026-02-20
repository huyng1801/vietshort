import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class AdminSettingsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // VIP PLANS
  // ═══════════════════════════════════════════════════════════

  async getVipPlans() {
    return this.prisma.vipPlan.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateVipPlanPrice(id: string, priceVnd: number) {
    const plan = await this.prisma.vipPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Gói VIP không tồn tại');

    const updated = await this.prisma.vipPlan.update({
      where: { id },
      data: { priceVnd },
    });

    // Clear cache
    await this.redisService.del('vip_plans:active');
    return updated;
  }

  // ═══════════════════════════════════════════════════════════
  // GOLD PACKAGES
  // ═══════════════════════════════════════════════════════════

  async getGoldPackages() {
    return this.prisma.goldPackage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getGoldPackageById(id: string) {
    const pkg = await this.prisma.goldPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Gói Gold không tồn tại');
    return pkg;
  }

  async createGoldPackage(data: {
    name: string;
    goldAmount: number;
    bonusGold?: number;
    priceVnd: number;
    isPopular?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    description?: string;
  }) {
    const pkg = await this.prisma.goldPackage.create({ data });
    await this.redisService.del('gold_packages:active');
    return pkg;
  }

  async updateGoldPackage(id: string, data: {
    name?: string;
    goldAmount?: number;
    bonusGold?: number;
    priceVnd?: number;
    isPopular?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    description?: string;
  }) {
    const existing = await this.prisma.goldPackage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Gói Gold không tồn tại');

    const updated = await this.prisma.goldPackage.update({
      where: { id },
      data,
    });

    await this.redisService.del('gold_packages:active');
    return updated;
  }

  async deleteGoldPackage(id: string) {
    const existing = await this.prisma.goldPackage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Gói Gold không tồn tại');

    await this.prisma.goldPackage.delete({ where: { id } });
    await this.redisService.del('gold_packages:active');
    return { message: 'Đã xóa gói Gold' };
  }
}
