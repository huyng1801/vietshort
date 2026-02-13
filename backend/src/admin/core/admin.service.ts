import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { JwtService } from '@nestjs/jwt';
import { AdminRole, PayoutStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { ADMIN_CONSTANTS, ADMIN_ERROR_MESSAGES } from './constants/admin.constants';
import { CreateAdminDto, LoginResponse } from './dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  // ─── Authentication ───────────────────────────────────
  async login(email: string, password: string): Promise<LoginResponse> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException(ADMIN_ERROR_MESSAGES.INVALID_ACCOUNT);
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException(ADMIN_ERROR_MESSAGES.INVALID_PASSWORD);
    }

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await this.createAuditLog(
      admin.id,
      ADMIN_CONSTANTS.AUDIT_ACTIONS.ADMIN_LOGIN,
      ADMIN_CONSTANTS.AUDIT_RESOURCES.ADMIN,
      admin.id,
      null,
    );

    const payload = { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: ADMIN_CONSTANTS.JWT.EXPIRATION }),
      admin: {
        id: admin.id,
        email: admin.email,
        nickname: admin.nickname,
        role: admin.role,
        permissions: JSON.parse(admin.permissions || '[]'),
      },
    };
  }

  async createAdmin(dto: CreateAdminDto, creatorRole: AdminRole) {
    if (creatorRole !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException(ADMIN_ERROR_MESSAGES.ONLY_SUPER_ADMIN_CAN_CREATE);
    }

    const emailExists = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (emailExists) {
      throw new ForbiddenException(ADMIN_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const nicknameExists = await this.prisma.admin.findUnique({ where: { nickname: dto.nickname } });
    if (nicknameExists) {
      throw new ForbiddenException(ADMIN_ERROR_MESSAGES.NICKNAME_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, ADMIN_CONSTANTS.BCRYPT_ROUNDS);
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

  // ─── Profile ───────────────────────────────────────
  async getProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        nickname: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) throw new UnauthorizedException('Admin not found');

    return {
      ...admin,
      permissions: JSON.parse(admin.permissions || '[]'),
    };
  }

  async updateProfile(adminId: string, data: { nickname?: string; firstName?: string; lastName?: string }) {
    const updateData: any = {};
    if (data.nickname) {
      const existing = await this.prisma.admin.findFirst({
        where: { nickname: data.nickname, id: { not: adminId } },
      });
      if (existing) throw new ForbiddenException('Nickname đã được sử dụng');
      updateData.nickname = data.nickname;
    }
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;

    return this.prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nickname: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException('Admin not found');

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');

    const hashedPassword = await bcrypt.hash(newPassword, ADMIN_CONSTANTS.BCRYPT_ROUNDS);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash: hashedPassword },
    });

    await this.createAuditLog(adminId, 'PASSWORD_CHANGED', 'ADMIN', adminId, null);

    return { message: 'Đổi mật khẩu thành công' };
  }

  // ─── Dashboard ────────────────────────────────────────
  async getDashboardStats() {
    const cacheKey = ADMIN_CONSTANTS.CACHE.DASHBOARD_STATS;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const stats = await this.fetchDashboardStats();
    await this.redisService.set(cacheKey, stats, ADMIN_CONSTANTS.CACHE_DURATION.DASHBOARD_STATS);
    return stats;
  }

  private async fetchDashboardStats() {
    const today = this.getTodayStartDate();

    const [
      totalUsers, totalVideos, totalTransactions, todayUsers,
      activeVipUsers, totalRevenue, todayRevenue, pendingPayouts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.video.count(),
      this.prisma.transaction.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({
        where: {
          vipTier: { not: null },
          vipExpiresAt: { gt: new Date() },
        },
      }),
      this.getTransactionRevenue({}),
      this.getTransactionRevenue({ createdAt: { gte: today } }),
      this.prisma.ctvPayout.count({ where: { status: PayoutStatus.PENDING } }),
    ]);

    return {
      totalUsers,
      totalVideos,
      totalTransactions,
      todayUsers,
      activeVipUsers,
      totalRevenue: totalRevenue || 0,
      todayRevenue: todayRevenue || 0,
      pendingPayouts,
    };
  }

  private async getTransactionRevenue(additionalWhere: any = {}) {
    const result = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        status: ADMIN_CONSTANTS.TRANSACTION_STATUS.COMPLETED,
        type: { in: [ADMIN_CONSTANTS.TRANSACTION_TYPES.PURCHASE_GOLD, ADMIN_CONSTANTS.TRANSACTION_TYPES.PURCHASE_VIP] },
        ...additionalWhere,
      },
    });
    return result._sum.amount || 0;
  }

  private getTodayStartDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // ─── Public Helper Methods for Other Services ────────
  async getRecentActivity(limit = 10) {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        admin: { select: { nickname: true, email: true } },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      type: this.mapAuditActionToType(log.action),
      title: this.mapAuditActionToTitle(log.action),
      description: log.resource + (log.resourceId ? ` #${log.resourceId.substring(0, 8)}` : ''),
      userName: log.admin?.nickname || log.admin?.email || 'System',
      timestamp: log.createdAt.toISOString(),
    }));
  }

  private mapAuditActionToType(action: string): string {
    if (action.includes('LOGIN') || action.includes('USER')) return 'user_register';
    if (action.includes('VIDEO') || action.includes('UPLOAD')) return 'video_upload';
    if (action.includes('PAYMENT') || action.includes('TRANSACTION')) return 'payment';
    if (action.includes('VIP')) return 'vip_purchase';
    if (action.includes('REPORT') || action.includes('BAN')) return 'report';
    return 'user_register';
  }

  private mapAuditActionToTitle(action: string): string {
    const titles: Record<string, string> = {
      ADMIN_LOGIN: 'Admin đăng nhập',
      VIDEO_CREATED: 'Video mới được tạo',
      VIDEO_PUBLISHED: 'Video đã xuất bản',
      VIDEO_DELETED: 'Video đã xóa',
      USER_LOCKED: 'Người dùng bị khóa',
      USER_BANNED: 'Người dùng bị cấm',
      PASSWORD_CHANGED: 'Đổi mật khẩu',
      PAYOUT_APPROVED: 'Thanh toán được duyệt',
    };
    return titles[action] || action.replace(/_/g, ' ').toLowerCase();
  }

  async createAuditLog(
    adminId: string | null,
    action: string,
    resource: string,
    resourceId: string | null,
    changes: any,
  ): Promise<void> {
    try {
      const logData: any = {
        action,
        resource,
        resourceId,
        changes: changes ? JSON.stringify(changes) : null,
      };

      if (adminId) {
        logData.adminId = adminId;
      }

      const checksum = this.generateChecksum(logData);

      await this.prisma.auditLog.create({
        data: { ...logData, checksum },
      });
    } catch (error) {
      this.logError('Failed to create audit log', error);
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.redisService.del(ADMIN_CONSTANTS.CACHE.USER_SESSION(userId));
  }

  async invalidateVideoCache(videoId: string): Promise<void> {
    await this.redisService.del(ADMIN_CONSTANTS.CACHE.VIDEO_CACHE(videoId));
  }

  // ─── Private Helpers ──────────────────────────────────
  private generateChecksum(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private logError(message: string, error: any): void {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    this.logger.error(`${message}: ${errorMsg}`, errorStack);
  }
}
