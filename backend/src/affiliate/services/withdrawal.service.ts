import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { PayoutStatus } from '@prisma/client';

@Injectable()
export class WithdrawalService {
  constructor(private prisma: PrismaService) {}

  async requestPayout(affiliateId: string, amount: number) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) throw new NotFoundException('Không tìm thấy CTV');
    if (affiliate.pendingPayout < amount) throw new BadRequestException('Số dư không đủ');
    if (!affiliate.bankAccount) throw new BadRequestException('Chưa cập nhật thông tin ngân hàng');

    return this.prisma.$transaction(async (tx) => {
      await tx.ctvAffiliate.update({
        where: { id: affiliate.id },
        data: { pendingPayout: { decrement: amount } },
      });

      return tx.ctvPayout.create({
        data: {
          affiliateId: affiliate.id,
          amount,
          bankName: affiliate.bankName || '',
          bankAccount: affiliate.bankAccount || '',
          status: PayoutStatus.PENDING,
        },
      });
    });
  }

  async getPayoutHistory(affiliateId: string, page = 1, limit = 20) {
    return this.prisma.paginate('ctvPayout', {
      page, limit,
      where: { affiliateId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPayoutById(payoutId: string) {
    return this.prisma.ctvPayout.findUnique({ where: { id: payoutId } });
  }
}
