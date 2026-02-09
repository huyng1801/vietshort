import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { JwtService } from '@nestjs/jwt';
import { AdminRole, VideoStatus, PayoutStatus, VipType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  // ─── Authentication ───────────────────────────────────
  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa');
    }

    // Rate limit check (commented out for testing)
    // const rateLimitKey = `admin_login:${email}`;
    // const attempts = await this.redisService.incrementRateLimit(rateLimitKey, 1800);
    // if (attempts > 5) {
    //   throw new UnauthorizedException('Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 30 phút.');
    // }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    // Reset rate limiter on success (commented out for testing)
    // await this.redisService.del(rateLimitKey);

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await this.createAuditLog(admin.id, 'ADMIN_LOGIN', 'admin', admin.id, null);

    const payload = { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '4h' }),
      admin: {
        id: admin.id,
        email: admin.email,
        nickname: admin.nickname,
        role: admin.role,
        permissions: JSON.parse(admin.permissions || '[]'),
      },
    };
  }

  async createAdmin(dto: any, creatorRole: AdminRole) {
    if (creatorRole !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Chỉ Super Admin mới tạo được admin');
    }

    const exists = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (exists) throw new ForbiddenException('Email đã tồn tại');

    const nicknameExists = await this.prisma.admin.findUnique({ where: { nickname: dto.nickname } });
    if (nicknameExists) throw new ForbiddenException('Nickname đã tồn tại');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    return this.prisma.admin.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        passwordHash: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || AdminRole.MODERATOR,
        permissions: JSON.stringify(dto.permissions || []),
      },
      select: { id: true, email: true, nickname: true, role: true, createdAt: true },
    });
  }

  // ─── Dashboard ────────────────────────────────────────
  async getDashboardStats() {
    const cacheKey = 'admin:dashboard_stats';
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalVideos, totalTransactions, todayUsers,
      activeVipUsers, totalRevenue, todayRevenue, pendingPayouts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.video.count(),
      this.prisma.transaction.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { vipTier: { not: null }, vipExpiresAt: { gt: new Date() } } }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', type: { in: ['PURCHASE_GOLD', 'PURCHASE_VIP'] } },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED', type: { in: ['PURCHASE_GOLD', 'PURCHASE_VIP'] }, createdAt: { gte: today } },
      }),
      this.prisma.ctvPayout.count({ where: { status: PayoutStatus.PENDING } }),
    ]);

    const stats = {
      totalUsers,
      totalVideos,
      totalTransactions,
      todayUsers,
      activeVipUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      todayRevenue: todayRevenue._sum.amount || 0,
      pendingPayouts,
    };

    await this.redisService.set(cacheKey, stats, 300);
    return stats;
  }

  // ─── User Management ──────────────────────────────────
  async getUsers(search?: string, page = 1, limit = 20) {
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { nickname: { contains: search } },
        { id: search },
      ];
    }

    return this.prisma.paginate('user', {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {},
    });
  }

  async lockUser(userId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    if (user.isLocked) throw new BadRequestException('Tài khoản đã bị khóa');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: true, lockReason: reason, lockedAt: new Date() },
      select: { id: true, email: true, nickname: true, isLocked: true, lockReason: true },
    });

    // Revoke all cached sessions
    await this.redisService.del(`user:${userId}`);

    await this.createAuditLog(null, 'LOCK_USER', 'user', userId, { reason });
    return updated;
  }

  async unlockUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    if (!user.isLocked) throw new BadRequestException('Tài khoản không bị khóa');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: false, lockReason: null, lockedAt: null, lockedBy: null },
      select: { id: true, email: true, nickname: true, isLocked: true },
    });

    await this.createAuditLog(null, 'UNLOCK_USER', 'user', userId, null);
    return updated;
  }

  async adjustUserGold(userId: string, amount: number, reason: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const newBalance = user.goldBalance + amount;
    if (newBalance < 0) throw new BadRequestException('Số dư không đủ để trừ');

    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { goldBalance: newBalance },
        select: { id: true, email: true, goldBalance: true },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'ADMIN_ADJUST',
          amount: 0,
          goldAmount: amount,
          provider: 'ADMIN',
          description: reason,
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      }),
    ]);

    await this.redisService.del(`user:${userId}`);
    await this.createAuditLog(adminId, 'ADJUST_GOLD', 'user', userId, {
      previousBalance: user.goldBalance, adjustment: amount, newBalance, reason,
    });

    return updatedUser;
  }

  async adjustUserVip(userId: string, vipType: VipType, vipDays: number, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const now = new Date();
    const currentExpiry = user.vipExpiresAt && user.vipExpiresAt > now ? user.vipExpiresAt : now;
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + vipDays);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { vipTier: vipType, vipExpiresAt: newExpiry },
      select: { id: true, email: true, vipTier: true, vipExpiresAt: true },
    });

    await this.redisService.del(`user:${userId}`);
    await this.createAuditLog(adminId, 'ADJUST_VIP', 'user', userId, {
      previousVipTier: user.vipTier, newVipTier: vipType, addedDays: vipDays, newExpiresAt: newExpiry,
    });

    return updated;
  }

  // ─── Video Management ─────────────────────────────────
  async getVideosForReview(page = 1, limit = 20) {
    return this.prisma.paginate('video', {
      page,
      limit,
      where: { status: VideoStatus.DRAFT },
      orderBy: { createdAt: 'desc' },
      include: { episodes: { select: { id: true, episodeNumber: true, encodingStatus: true } } },
    });
  }

  async approveVideo(videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video không tồn tại');
    if (video.status !== VideoStatus.DRAFT) {
      throw new BadRequestException('Chỉ video ở trạng thái nháp mới duyệt được');
    }

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.PUBLISHED, publishedAt: new Date() },
    });

    await this.redisService.del(`video:${videoId}`);
    await this.createAuditLog(null, 'APPROVE_VIDEO', 'video', videoId, { title: video.title });
    return updated;
  }

  async rejectVideo(videoId: string, reason: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video không tồn tại');

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.ARCHIVED },
    });

    await this.redisService.del(`video:${videoId}`);
    await this.createAuditLog(null, 'REJECT_VIDEO', 'video', videoId, { title: video.title, reason });
    return updated;
  }

  // ─── Affiliate/Payout Management ─────────────────────
  async getPendingPayouts(page = 1, limit = 20) {
    return this.prisma.paginate('ctvPayout', {
      page,
      limit,
      where: { status: PayoutStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        affiliate: {
          select: { id: true, nickname: true, email: true, realName: true, bankAccount: true, bankName: true },
        },
      },
    });
  }

  async approvePayout(payoutId: string) {
    const payout = await this.prisma.ctvPayout.findUnique({
      where: { id: payoutId },
      include: { affiliate: true },
    });
    if (!payout) throw new NotFoundException('Yêu cầu rút tiền không tồn tại');
    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.ctvPayout.update({
        where: { id: payoutId },
        data: { status: PayoutStatus.APPROVED, processedAt: new Date() },
      });

      await tx.ctvAffiliate.update({
        where: { id: payout.affiliateId },
        data: {
          pendingPayout: { decrement: payout.amount },
          paidOut: { increment: payout.amount },
        },
      });

      return result;
    });

    await this.createAuditLog(null, 'APPROVE_PAYOUT', 'payout', payoutId, {
      affiliateId: payout.affiliateId, amount: payout.amount,
    });

    return updated;
  }

  async rejectPayout(payoutId: string, reason: string) {
    const payout = await this.prisma.ctvPayout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Yêu cầu rút tiền không tồn tại');
    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.ctvPayout.update({
        where: { id: payoutId },
        data: { status: PayoutStatus.REJECTED, notes: reason, processedAt: new Date() },
      });

      // Return funds to pending balance
      await tx.ctvAffiliate.update({
        where: { id: payout.affiliateId },
        data: { pendingPayout: { decrement: payout.amount } },
      });

      return result;
    });

    await this.createAuditLog(null, 'REJECT_PAYOUT', 'payout', payoutId, {
      affiliateId: payout.affiliateId, amount: payout.amount, reason,
    });

    return updated;
  }

  // ─── Audit Logs ───────────────────────────────────────
  async getAuditLogs(page = 1, limit = 50) {
    return this.prisma.paginate('auditLog', {
      page,
      limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, nickname: true, role: true } },
      },
    });
  }

  // ─── Private Helpers ──────────────────────────────────
  private async createAuditLog(
    adminId: string | null,
    action: string,
    resource: string,
    resourceId: string | null,
    changes: any,
  ) {
    const logData: any = {
      action,
      resource,
      resourceId,
      changes: changes ? JSON.stringify(changes) : null,
    };

    // Only add adminId if it exists
    if (adminId) {
      logData.adminId = adminId;
    }

    const checksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(logData))
      .digest('hex');

    try {
      await this.prisma.auditLog.create({
        data: { ...logData, checksum },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`Failed to create audit log: ${errorMsg}`, errorStack);
    }
  }
}
