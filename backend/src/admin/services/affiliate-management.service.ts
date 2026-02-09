import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { PayoutStatus } from '@prisma/client';

@Injectable()
export class AffiliateManagementService {
  constructor(private prisma: PrismaService) {}

  async getAffiliates(page = 1, limit = 20, search?: string) {
    const where = search ? {
      OR: [
        { email: { contains: search } },
        { nickname: { contains: search } },
        { referralCode: { contains: search } },
      ],
    } : {};
    return this.prisma.paginate('ctvAffiliate', { page, limit, where, orderBy: { createdAt: 'desc' } });
  }

  async getPendingPayouts(page = 1, limit = 20) {
    return this.prisma.paginate('ctvPayout', {
      page, limit,
      where: { status: PayoutStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approvePayout(payoutId: string) {
    return this.prisma.ctvPayout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.APPROVED, processedAt: new Date() },
    });
  }

  async rejectPayout(payoutId: string) {
    const payout = await this.prisma.ctvPayout.findUnique({ where: { id: payoutId }, include: { affiliate: true } });
    if (!payout) throw new NotFoundException('Không tìm thấy yêu cầu');

    return this.prisma.$transaction([
      this.prisma.ctvPayout.update({ where: { id: payoutId }, data: { status: PayoutStatus.REJECTED } }),
      this.prisma.ctvAffiliate.update({ where: { id: payout.affiliateId }, data: { pendingPayout: { increment: payout.amount } } }),
    ]);
  }

  async toggleAffiliateStatus(affiliateId: string, isActive: boolean) {
    return this.prisma.ctvAffiliate.update({
      where: { id: affiliateId },
      data: { isActive },
    });
  }
}
