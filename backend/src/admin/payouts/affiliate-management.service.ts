import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { PayoutStatus, AffiliateType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Common select fields for affiliate queries
const AFFILIATE_SELECT = {
  id: true,
  email: true,
  nickname: true,
  companyName: true,
  realName: true,
  phone: true,
  bankAccount: true,
  bankName: true,
  parentId: true,
  tier: true,
  affiliateType: true,
  commissionRate: true,
  totalEarned: true,
  pendingPayout: true,
  paidOut: true,
  networkEarned: true,
  networkMembers: true,
  contractNotes: true,
  contractStartAt: true,
  contractEndAt: true,
  referralCode: true,
  referralUrl: true,
  totalClicks: true,
  totalRegistrations: true,
  totalPurchasers: true,
  isActive: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AffiliateManagementService {
  constructor(private prisma: PrismaService) {}

  // ===== Affiliates =====

  async getAffiliates(
    page = 1,
    limit = 20,
    search?: string,
    isActive?: string,
    isVerified?: string,
    dateFrom?: string,
    dateTo?: string,
    tier?: string,
    parentId?: string,
    affiliateType?: string,
  ) {
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { nickname: { contains: search } },
        { realName: { contains: search } },
        { referralCode: { contains: search } },
        { companyName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }
    if (isVerified !== undefined && isVerified !== '') {
      where.isVerified = isVerified === 'true';
    }
    if (tier !== undefined && tier !== '') {
      where.tier = parseInt(tier, 10);
    }
    if (parentId !== undefined && parentId !== '') {
      where.parentId = parentId === 'null' ? null : parentId;
    }
    if (affiliateType !== undefined && affiliateType !== '') {
      where.affiliateType = affiliateType;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    return this.prisma.paginate('ctvAffiliate', {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        ...AFFILIATE_SELECT,
        _count: { select: { referrals: true, payouts: true, children: true } },
        parent: { select: { id: true, realName: true, nickname: true, companyName: true, tier: true } },
      },
    });
  }

  async getAffiliateById(id: string) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({
      where: { id },
      select: {
        ...AFFILIATE_SELECT,
        _count: { select: { referrals: true, payouts: true, children: true } },
        parent: { select: { id: true, realName: true, nickname: true, companyName: true, tier: true, commissionRate: true } },
        children: {
          select: {
            ...AFFILIATE_SELECT,
            _count: { select: { referrals: true, children: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!affiliate) throw new NotFoundException('Không tìm thấy CTV');
    return affiliate;
  }

  /**
   * Get the full tree for a Tier 1 affiliate (up to 3 levels deep)
   */
  async getAffiliateTree(id: string) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({
      where: { id },
      select: {
        ...AFFILIATE_SELECT,
        _count: { select: { referrals: true, payouts: true, children: true } },
        children: {
          select: {
            ...AFFILIATE_SELECT,
            _count: { select: { referrals: true, children: true } },
            children: {
              select: {
                ...AFFILIATE_SELECT,
                _count: { select: { referrals: true, children: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!affiliate) throw new NotFoundException('Không tìm thấy CTV');
    return affiliate;
  }

  /**
   * Get sub-affiliates (direct children) of a given affiliate
   */
  async getSubAffiliates(parentId: string, page = 1, limit = 20) {
    const parent = await this.prisma.ctvAffiliate.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundException('Không tìm thấy CTV cha');

    return this.prisma.paginate('ctvAffiliate', {
      page,
      limit,
      where: { parentId },
      orderBy: { createdAt: 'desc' },
      select: {
        ...AFFILIATE_SELECT,
        _count: { select: { referrals: true, payouts: true, children: true } },
      },
    });
  }

  /**
   * Get network stats for an affiliate (aggregated from all descendants)
   */
  async getNetworkStats(id: string) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { id } });
    if (!affiliate) throw new NotFoundException('Không tìm thấy CTV');

    // Get all descendant IDs recursively
    const descendants = await this.getAllDescendantIds(id);

    // Aggregate stats
    const stats = await this.prisma.ctvAffiliate.aggregate({
      where: { id: { in: descendants } },
      _sum: {
        totalEarned: true,
        totalClicks: true,
        totalRegistrations: true,
        totalPurchasers: true,
      },
      _count: true,
    });

    return {
      networkMembers: stats._count,
      networkTotalEarned: stats._sum.totalEarned || 0,
      networkTotalClicks: stats._sum.totalClicks || 0,
      networkTotalRegistrations: stats._sum.totalRegistrations || 0,
      networkTotalPurchasers: stats._sum.totalPurchasers || 0,
      ownEarned: affiliate.totalEarned,
      ownClicks: affiliate.totalClicks,
      ownRegistrations: affiliate.totalRegistrations,
      ownPurchasers: affiliate.totalPurchasers,
    };
  }

  private async getAllDescendantIds(parentId: string): Promise<string[]> {
    const children = await this.prisma.ctvAffiliate.findMany({
      where: { parentId },
      select: { id: true },
    });

    const childIds = children.map((c) => c.id);
    const deeperIds: string[] = [];

    for (const childId of childIds) {
      const subIds = await this.getAllDescendantIds(childId);
      deeperIds.push(...subIds);
    }

    return [...childIds, ...deeperIds];
  }

  async createAffiliate(data: {
    email: string;
    nickname: string;
    password: string;
    realName: string;
    companyName?: string;
    phone?: string;
    bankAccount?: string;
    bankName?: string;
    commissionRate?: number;
    parentId?: string;
    affiliateType?: AffiliateType;
    contractNotes?: string;
    contractStartAt?: string;
    contractEndAt?: string;
  }) {
    // Check uniqueness
    const existing = await this.prisma.ctvAffiliate.findFirst({
      where: { OR: [{ email: data.email }, { nickname: data.nickname }] },
    });
    if (existing) throw new ConflictException('Email hoặc nickname đã tồn tại');

    // Determine tier from parent
    let tier = 1;
    let affiliateType = data.affiliateType || AffiliateType.COMPANY;

    if (data.parentId) {
      const parent = await this.prisma.ctvAffiliate.findUnique({
        where: { id: data.parentId },
        select: { tier: true, isActive: true },
      });
      if (!parent) throw new NotFoundException('Không tìm thấy CTV cha');
      if (!parent.isActive) throw new BadRequestException('CTV cha đã bị vô hiệu hóa');
      if (parent.tier >= 3) throw new BadRequestException('Không thể tạo CTV cấp dưới cho cấp 3');

      tier = parent.tier + 1;
      affiliateType = AffiliateType.INDIVIDUAL; // Tier 2/3 always individual

      // Validate commission rate doesn't exceed parent's
      // (platform logic: Tier 2/3 rates are sub-allocations within parent's rate)
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const referralCode = await this.generateUniqueReferralCode(tier);
    const referralUrl = `https://vietshort.vn/?ref=${referralCode}`;

    const created = await this.prisma.ctvAffiliate.create({
      data: {
        email: data.email,
        nickname: data.nickname,
        passwordHash,
        realName: data.realName,
        companyName: data.companyName,
        phone: data.phone,
        bankAccount: data.bankAccount,
        bankName: data.bankName,
        commissionRate: data.commissionRate ?? (tier === 1 ? 0.3 : 0.1),
        parentId: data.parentId || null,
        tier,
        affiliateType,
        referralCode,
        referralUrl,
        contractNotes: tier === 1 ? data.contractNotes : null,
        contractStartAt: data.contractStartAt ? new Date(data.contractStartAt) : null,
        contractEndAt: data.contractEndAt ? new Date(data.contractEndAt) : null,
      },
    });

    // Update parent's networkMembers count
    if (data.parentId) {
      await this.updateNetworkMemberCounts(data.parentId);
    }

    return created;
  }

  async updateAffiliate(id: string, data: {
    realName?: string;
    companyName?: string;
    phone?: string;
    bankAccount?: string;
    bankName?: string;
    commissionRate?: number;
    isActive?: boolean;
    isVerified?: boolean;
    contractNotes?: string;
    contractStartAt?: string;
    contractEndAt?: string;
  }) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { id } });
    if (!affiliate) throw new NotFoundException('Không tìm thấy CTV');

    const updateData: any = { ...data };
    if (data.contractStartAt) updateData.contractStartAt = new Date(data.contractStartAt);
    if (data.contractEndAt) updateData.contractEndAt = new Date(data.contractEndAt);

    return this.prisma.ctvAffiliate.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Update networkMembers count for an affiliate and all ancestors
   */
  private async updateNetworkMemberCounts(affiliateId: string) {
    const descendants = await this.getAllDescendantIds(affiliateId);
    await this.prisma.ctvAffiliate.update({
      where: { id: affiliateId },
      data: { networkMembers: descendants.length },
    });

    // Also update ancestors
    const affiliate = await this.prisma.ctvAffiliate.findUnique({
      where: { id: affiliateId },
      select: { parentId: true },
    });
    if (affiliate?.parentId) {
      await this.updateNetworkMemberCounts(affiliate.parentId);
    }
  }

  // ===== Referrals =====

  async getAffiliateReferrals(affiliateId: string, page = 1, limit = 20) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) throw new NotFoundException('Không tìm thấy CTV');

    return this.prisma.paginate('ctvReferral', {
      page,
      limit,
      where: { affiliateId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, email: true, avatar: true } },
      },
    });
  }

  // ===== Payouts =====

  async getAffiliatePayouts(affiliateId: string, page = 1, limit = 20, status?: string) {
    const where: any = { affiliateId };
    if (status) where.status = status;

    return this.prisma.paginate('ctvPayout', {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingPayouts(page = 1, limit = 20) {
    return this.prisma.paginate('ctvPayout', {
      page,
      limit,
      where: { status: PayoutStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: {
        affiliate: { select: { id: true, realName: true, nickname: true, tier: true, companyName: true } },
      },
    });
  }

  async approvePayout(payoutId: string, adminId?: string) {
    const payout = await this.prisma.ctvPayout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (payout.status !== PayoutStatus.PENDING) {
      throw new ConflictException('Yêu cầu đã được xử lý');
    }

    return this.prisma.$transaction([
      this.prisma.ctvPayout.update({
        where: { id: payoutId },
        data: { status: PayoutStatus.APPROVED, processedAt: new Date(), processedBy: adminId },
      }),
      this.prisma.ctvAffiliate.update({
        where: { id: payout.affiliateId },
        data: {
          pendingPayout: { decrement: payout.amount },
          paidOut: { increment: payout.amount },
        },
      }),
    ]);
  }

  async rejectPayout(payoutId: string, reason?: string, adminId?: string) {
    const payout = await this.prisma.ctvPayout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Không tìm thấy yêu cầu');
    if (payout.status !== PayoutStatus.PENDING) {
      throw new ConflictException('Yêu cầu đã được xử lý');
    }

    return this.prisma.ctvPayout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.REJECTED,
        notes: reason,
        processedAt: new Date(),
        processedBy: adminId,
      },
    });
  }

  async toggleAffiliateStatus(affiliateId: string, isActive: boolean) {
    const affiliate = await this.prisma.ctvAffiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) throw new NotFoundException('Không tìm thấy CTV');

    // When deactivating a parent, optionally deactivate children too
    if (!isActive) {
      const childIds = await this.getAllDescendantIds(affiliateId);
      if (childIds.length > 0) {
        await this.prisma.ctvAffiliate.updateMany({
          where: { id: { in: childIds } },
          data: { isActive: false },
        });
      }
    }

    return this.prisma.ctvAffiliate.update({
      where: { id: affiliateId },
      data: { isActive },
    });
  }

  // ===== Helpers =====

  private async generateUniqueReferralCode(tier: number): Promise<string> {
    const prefix = tier === 1 ? 'CTV' : tier === 2 ? 'SUB' : 'REF';
    let code: string;
    let exists = true;

    while (exists) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      code = prefix;
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const found = await this.prisma.ctvAffiliate.findUnique({ where: { referralCode: code } });
      exists = !!found;
    }

    return code!;
  }
}
