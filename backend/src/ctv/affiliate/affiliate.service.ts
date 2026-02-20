import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { RegisterAffiliateDto, RequestPayoutDto } from './dto/affiliate.dto';
import { PayoutStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AffiliateService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async register(dto: RegisterAffiliateDto) {
    const exists = await this.prisma.ctvAffiliate.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email đã đăng ký CTV');

    const referralCode = this.generateReferralCode();
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    return this.prisma.ctvAffiliate.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        passwordHash: hashedPassword,
        realName: dto.fullName,
        phone: dto.phone,
        bankAccount: dto.bankAccount,
        bankName: dto.bankName,
        referralCode,
        referralUrl: `https://vietshort.vn/?ref=${referralCode}`,
        commissionRate: 0.10,
      },
      select: { id: true, email: true, nickname: true, referralCode: true, referralUrl: true, createdAt: true },
    });
  }

  async login(email: string, password: string) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { email } });
    if (!affiliate || !affiliate.isActive) throw new NotFoundException('Tài khoản không hợp lệ');

    const valid = await bcrypt.compare(password, affiliate.passwordHash);
    if (!valid) throw new BadRequestException('Mật khẩu không đúng');

    return { id: affiliate.id, email: affiliate.email, nickname: affiliate.nickname, referralCode: affiliate.referralCode };
  }

  async getProfile(affiliateId: string) {
    return this.prisma.ctvAffiliate.findUnique({
      where: { id: affiliateId },
      include: { _count: { select: { referrals: true, payouts: true } } },
    });
  }

  async trackReferral(referralCode: string, userId: string, ip: string) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { referralCode } });
    if (!affiliate) return;

    // Fraud detection: same IP check
    const ipKey = `referral_ip:${ip}`;
    const ipCount = await this.redisService.get<number>(ipKey);
    if (ipCount && Number(ipCount) > 5) return;
    await this.redisService.incrementRateLimit(ipKey, 86400);

    const exists = await this.prisma.ctvReferral.findFirst({
      where: { affiliateId: affiliate.id, userId },
    });
    if (exists) return;

    await this.prisma.ctvReferral.create({
      data: { affiliateId: affiliate.id, userId, ipAddress: ip, registeredAt: new Date() },
    });
  }

  async addCommission(affiliateId: string, amount: number) {
    const affiliate = await this.prisma.ctvAffiliate.update({
      where: { id: affiliateId },
      data: {
        totalEarned: { increment: amount },
        pendingPayout: { increment: amount },
      },
    });

    // Propagate networkEarned to all ancestors
    await this.propagateNetworkEarned(affiliate.parentId, amount);
  }

  /**
   * Increment networkEarned for all ancestor affiliates up the tree
   */
  private async propagateNetworkEarned(parentId: string | null, amount: number) {
    let currentParentId = parentId;
    while (currentParentId) {
      const parent = await this.prisma.ctvAffiliate.update({
        where: { id: currentParentId },
        data: { networkEarned: { increment: amount } },
      });
      currentParentId = parent.parentId;
    }
  }

  async requestPayout(affiliateId: string, dto: RequestPayoutDto) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) throw new NotFoundException('Không tìm thấy CTV');
    if (affiliate.pendingPayout < dto.amount) throw new BadRequestException('Số dư không đủ');
    if (!affiliate.bankAccount) throw new BadRequestException('Chưa cập nhật thông tin ngân hàng');

    return this.prisma.$transaction(async (tx) => {
      await tx.ctvAffiliate.update({
        where: { id: affiliate.id },
        data: { pendingPayout: { decrement: dto.amount } },
      });

      return tx.ctvPayout.create({
        data: {
          affiliateId: affiliate.id,
          amount: dto.amount,
          bankName: affiliate.bankName || '',
          bankAccount: affiliate.bankAccount || '',
          status: PayoutStatus.PENDING,
        },
      });
    });
  }

  async getReferrals(affiliateId: string, page = 1, limit = 20) {
    return this.prisma.paginate(
      'ctvReferral',
      { page, limit, where: { affiliateId }, include: { user: { select: { email: true, createdAt: true } } }, orderBy: { createdAt: 'desc' } },
    );
  }

  async getPayouts(affiliateId: string, page = 1, limit = 20) {
    return this.prisma.paginate(
      'ctvPayout',
      { page, limit, where: { affiliateId }, orderBy: { createdAt: 'desc' } },
    );
  }

  private generateReferralCode(): string {
    return 'CTV' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}
