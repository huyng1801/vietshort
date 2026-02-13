import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { VipType } from '@prisma/client';
import { ADMIN_CONSTANTS, ADMIN_ERROR_MESSAGES } from '../core/constants/admin.constants';
import { AdminService } from '../core/admin.service';

@Injectable()
export class UserManagementService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private adminService: AdminService,
  ) {}

  async getUsers(search?: string, page?: number, limit?: number, filters?: any) {
    const actualPage = page || ADMIN_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const actualLimit = limit || ADMIN_CONSTANTS.PAGINATION.DEFAULT_LIMIT;
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { id: search },
      ];
    }

    // VIP tier filter
    if (filters?.vipTier) {
      if (filters.vipTier === 'null') {
        where.vipTier = null;
      } else {
        where.vipTier = filters.vipTier;
      }
    }

    // Status filters
    if (filters?.isLocked !== undefined) {
      where.isLocked = filters.isLocked === 'true' || filters.isLocked === true;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    if (filters?.isEmailVerified !== undefined) {
      where.isEmailVerified = filters.isEmailVerified === 'true' || filters.isEmailVerified === true;
    }

    // Registration source filter
    if (filters?.registrationSource) {
      where.registrationSource = filters.registrationSource;
    }

    // Date range filter
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    return this.prisma.paginate('user', {
      page: actualPage,
      limit: actualLimit,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        nickname: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        gender: true,
        vipTier: true,
        vipExpiresAt: true,
        goldBalance: true,
        isEmailVerified: true,
        isActive: true,
        isLocked: true,
        lockReason: true,
        lockedAt: true,
        registrationSource: true,
        country: true,
        language: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            ratings: true,
            comments: true,
            transactions: true,
            watchHistory: true,
            favorites: true,
          },
        },
      },
    });
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        gender: true,
        vipTier: true,
        vipExpiresAt: true,
        goldBalance: true,
        isEmailVerified: true,
        isActive: true,
        isLocked: true,
        lockReason: true,
        lockedAt: true,
        registrationSource: true,
        country: true,
        language: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        googleId: true,
        facebookId: true,
        appleId: true,
        tiktokId: true,
        deviceId: true,
        _count: {
          select: {
            ratings: true,
            comments: true,
            transactions: true,
            watchHistory: true,
            favorites: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async lockUser(userId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(ADMIN_ERROR_MESSAGES.USER_NOT_FOUND);
    }
    if (user.isLocked) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGES.ACCOUNT_ALREADY_LOCKED);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: true, lockReason: reason, lockedAt: new Date() },
      select: { id: true, email: true, nickname: true, isLocked: true, lockReason: true },
    });

    await this.adminService.invalidateUserCache(userId);
    await this.adminService.createAuditLog(null, ADMIN_CONSTANTS.AUDIT_ACTIONS.LOCK_USER, ADMIN_CONSTANTS.AUDIT_RESOURCES.USER, userId, { reason });
    return updated;
  }

  async unlockUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(ADMIN_ERROR_MESSAGES.USER_NOT_FOUND);
    }
    if (!user.isLocked) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGES.ACCOUNT_NOT_LOCKED);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: false, lockReason: null, lockedAt: null, lockedBy: null },
      select: { id: true, email: true, nickname: true, isLocked: true },
    });

    await this.adminService.invalidateUserCache(userId);
    await this.adminService.createAuditLog(null, ADMIN_CONSTANTS.AUDIT_ACTIONS.UNLOCK_USER, ADMIN_CONSTANTS.AUDIT_RESOURCES.USER, userId, null);
    return updated;
  }

  async adjustUserGold(userId: string, amount: number, reason: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(ADMIN_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const newBalance = user.goldBalance + amount;
    if (newBalance < 0) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGES.INSUFFICIENT_BALANCE);
    }

    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { goldBalance: newBalance },
        select: { id: true, email: true, goldBalance: true },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: ADMIN_CONSTANTS.TRANSACTION_TYPES.ADMIN_ADJUST,
          amount: 0,
          rewardValue: amount,
          provider: ADMIN_CONSTANTS.PROVIDER_TYPES.ADMIN,
          description: reason,
          status: ADMIN_CONSTANTS.TRANSACTION_STATUS.COMPLETED,
          processedAt: new Date(),
        },
      }),
    ]);

    await this.adminService.invalidateUserCache(userId);
    await this.adminService.createAuditLog(adminId, ADMIN_CONSTANTS.AUDIT_ACTIONS.ADJUST_GOLD, ADMIN_CONSTANTS.AUDIT_RESOURCES.USER, userId, {
      previousBalance: user.goldBalance,
      adjustment: amount,
      newBalance,
      reason,
    });

    return updatedUser;
  }

  async adjustUserVip(userId: string, vipType: VipType, vipDays: number, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(ADMIN_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const newExpiry = this.calculateVipExpiry(user.vipExpiresAt, vipDays);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { vipTier: vipType, vipExpiresAt: newExpiry },
      select: { id: true, email: true, vipTier: true, vipExpiresAt: true },
    });

    await this.adminService.invalidateUserCache(userId);
    await this.adminService.createAuditLog(adminId, ADMIN_CONSTANTS.AUDIT_ACTIONS.ADJUST_VIP, ADMIN_CONSTANTS.AUDIT_RESOURCES.USER, userId, {
      previousVipTier: user.vipTier,
      newVipTier: vipType,
      addedDays: vipDays,
      newExpiresAt: newExpiry,
    });

    return updated;
  }

  async updateUserBalance(userId: string, goldBalance: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { goldBalance },
      select: { id: true, nickname: true, goldBalance: true },
    });
  }

  async getTransactionsByUserId(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          rewardValue: true,
          provider: true,
          status: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private calculateVipExpiry(currentExpiry: Date | null, extraDays: number): Date {
    const now = new Date();
    const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + extraDays);
    return newExpiry;
  }
}
