import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../config/database.config';

@Injectable()
export class CommissionService {
  constructor(private prisma: PrismaService) {}

  async calculateCommission(affiliateId: string, transactionAmount: number): Promise<number> {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) return 0;
    return Math.floor(transactionAmount * affiliate.commissionRate);
  }

  async addCommission(affiliateId: string, amount: number, referralId?: string) {
    return this.prisma.ctvAffiliate.update({
      where: { id: affiliateId },
      data: {
        totalEarned: { increment: amount },
        pendingPayout: { increment: amount },
      },
    });
  }

  async getCommissionHistory(affiliateId: string, page = 1, limit = 20) {
    return this.prisma.paginate('ctvReferral', {
      page, limit,
      where: { affiliateId, commission: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCommissionStats(affiliateId: string) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({
      where: { id: affiliateId },
      select: { totalEarned: true, pendingPayout: true, commissionRate: true },
    });
    return affiliate;
  }
}
