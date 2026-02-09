import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { WalletService } from '../wallet/wallet.service';
import { VipService } from '../vip/vip.service';
import { RewardType, VipType } from '@prisma/client';
import { CreateExchangeCodeDto } from './dto/exchange-code.dto';

@Injectable()
export class ExchangeCodesService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private vipService: VipService,
  ) {}

  async create(dto: CreateExchangeCodeDto) {
    return this.prisma.exchangeCode.create({
      data: {
        code: dto.code.toUpperCase(),
        batchName: dto.batchName || '',
        rewardType: dto.rewardType as RewardType,
        rewardValue: dto.rewardValue,
        usageLimit: dto.maxUses || 1,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdBy: dto.createdBy || '',
      },
    });
  }

  async redeem(userId: string, code: string) {
    const exchangeCode = await this.prisma.exchangeCode.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!exchangeCode || !exchangeCode.isActive) throw new NotFoundException('Mã không hợp lệ');
    if (exchangeCode.expiresAt && exchangeCode.expiresAt < new Date()) throw new BadRequestException('Mã đã hết hạn');
    if (exchangeCode.usedCount >= exchangeCode.usageLimit) throw new BadRequestException('Mã đã hết lượt sử dụng');

    const existing = await this.prisma.exchangeRedeem.findUnique({
      where: { userId_codeId: { userId, codeId: exchangeCode.id } },
    });
    if (existing) throw new BadRequestException('Bạn đã sử dụng mã này');

    return this.prisma.$transaction(async (tx) => {
      await tx.exchangeRedeem.create({ data: { userId, codeId: exchangeCode.id } });
      await tx.exchangeCode.update({ where: { id: exchangeCode.id }, data: { usedCount: { increment: 1 } } });

      let reward: any = {};
      switch (exchangeCode.rewardType) {
        case RewardType.GOLD:
          await this.walletService.addGold(userId, exchangeCode.rewardValue, `Nhập mã: ${code}`);
          reward = { type: 'gold', amount: exchangeCode.rewardValue };
          break;
        case RewardType.VIP_DAYS:
          await this.vipService.activateVip(userId, VipType.VIP_FREEADS, exchangeCode.rewardValue);
          reward = { type: 'vip', days: exchangeCode.rewardValue };
          break;
      }

      return { success: true, reward };
    });
  }

  async findAll(page = 1, limit = 20) {
    return this.prisma.paginate('exchangeCode', { page, limit, orderBy: { createdAt: 'desc' } });
  }
}
