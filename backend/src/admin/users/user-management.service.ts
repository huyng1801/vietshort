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

  // ═══════════════════════════════════════════════════════════
  // WATCH HISTORY
  // ═══════════════════════════════════════════════════════════

  async getUserWatchHistory(userId: string, page = 1, limit = 20, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (filters?.videoId) {
      where.videoId = filters.videoId;
    }
    if (filters?.isCompleted !== undefined) {
      where.isCompleted = filters.isCompleted === 'true' || filters.isCompleted === true;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          videoId: true,
          episodeId: true,
          watchTime: true,
          progressive: true,
          isCompleted: true,
          createdAt: true,
          updatedAt: true,
          video: {
            select: { id: true, title: true, slug: true, poster: true },
          },
          episode: {
            select: { id: true, title: true, episodeNumber: true },
          },
        },
      }),
      this.prisma.watchHistory.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // UNLOCK HISTORY
  // ═══════════════════════════════════════════════════════════

  async getUserUnlockHistory(userId: string, page = 1, limit = 20, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (filters?.method) {
      where.method = filters.method;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.videoUnlock.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          episodeId: true,
          method: true,
          goldSpent: true,
          adWatched: true,
          createdAt: true,
          episode: {
            select: {
              id: true,
              title: true,
              episodeNumber: true,
              video: {
                select: { id: true, title: true, slug: true, poster: true },
              },
            },
          },
        },
      }),
      this.prisma.videoUnlock.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // CHECK-IN HISTORY
  // ═══════════════════════════════════════════════════════════

  async getUserCheckInHistory(userId: string, page = 1, limit = 30, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.checkIn.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          date: true,
          day: true,
          rewardGold: true,
          createdAt: true,
        },
      }),
      this.prisma.checkIn.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // USER ENGAGEMENT STATS
  // ═══════════════════════════════════════════════════════════

  async getUserEngagementStats(userId: string) {
    const [
      totalWatchTime,
      totalWatchCount,
      completedCount,
      totalUnlocks,
      goldSpentOnUnlocks,
      adUnlocks,
      totalCheckIns,
      totalCheckInGold,
      totalFavorites,
      totalLikes,
      totalComments,
      totalRatings,
      totalTransactions,
      totalSpent,
      achievements,
    ] = await Promise.all([
      // Watch stats
      this.prisma.watchHistory.aggregate({
        where: { userId },
        _sum: { watchTime: true },
      }),
      this.prisma.watchHistory.count({ where: { userId } }),
      this.prisma.watchHistory.count({ where: { userId, isCompleted: true } }),
      // Unlock stats
      this.prisma.videoUnlock.count({ where: { userId } }),
      this.prisma.videoUnlock.aggregate({
        where: { userId, method: 'GOLD' },
        _sum: { goldSpent: true },
      }),
      this.prisma.videoUnlock.count({ where: { userId, method: 'AD' } }),
      // Check-in stats
      this.prisma.checkIn.count({ where: { userId } }),
      this.prisma.checkIn.aggregate({
        where: { userId },
        _sum: { rewardGold: true },
      }),
      // Social stats
      this.prisma.favorite.count({ where: { userId } }),
      this.prisma.like.count({ where: { userId } }),
      this.prisma.comment.count({ where: { userId } }),
      this.prisma.rating.count({ where: { userId } }),
      // Financial stats
      this.prisma.transaction.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.transaction.aggregate({
        where: { userId, status: 'COMPLETED', type: { in: ['PURCHASE_GOLD', 'PURCHASE_VIP'] } },
        _sum: { amount: true },
      }),
      // Achievements
      this.prisma.userAchievement.count({ where: { userId } }),
    ]);

    return {
      watch: {
        totalWatchTime: totalWatchTime._sum.watchTime || 0,
        totalWatchCount: totalWatchCount,
        completedCount,
      },
      unlock: {
        totalUnlocks,
        goldSpentOnUnlocks: goldSpentOnUnlocks._sum.goldSpent || 0,
        adUnlocks,
      },
      checkIn: {
        totalCheckIns,
        totalCheckInGold: totalCheckInGold._sum.rewardGold || 0,
      },
      social: {
        totalFavorites,
        totalLikes,
        totalComments,
        totalRatings,
      },
      financial: {
        totalTransactions,
        totalSpent: totalSpent._sum?.amount || 0,
      },
      achievements,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // USER REFERRALS (TEAM MEMBERS)
  // ═══════════════════════════════════════════════════════════

  async getUserReferrals(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Check if user was referred by someone
    const referredBy = await this.prisma.ctvReferral.findFirst({
      where: { userId },
      select: {
        id: true,
        registeredAt: true,
        totalRevenue: true,
        totalCommission: true,
        affiliate: {
          select: { id: true, referralCode: true, nickname: true, email: true, tier: true },
        },
      },
    });

    // Check if user is an affiliate (CTV) who referred others
    const affiliate = await this.prisma.ctvAffiliate.findFirst({
      where: { email: (await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email },
      select: { id: true, referralCode: true, tier: true, nickname: true, totalRegistrations: true },
    });

    let referrals = { items: [] as any[], pagination: { page, limit, total: 0, totalPages: 0 } };

    if (affiliate) {
      const [items, total] = await Promise.all([
        this.prisma.ctvReferral.findMany({
          where: { affiliateId: affiliate.id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            registeredAt: true,
            firstPurchaseAt: true,
            totalRevenue: true,
            totalCommission: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                nickname: true,
                email: true,
                avatar: true,
                vipTier: true,
                goldBalance: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
              },
            },
          },
        }),
        this.prisma.ctvReferral.count({ where: { affiliateId: affiliate.id } }),
      ]);

      referrals = {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }

    return {
      isAffiliate: !!affiliate,
      affiliate: affiliate ? { id: affiliate.id, affiliateCode: affiliate.referralCode, tier: `Tier ${affiliate.tier}` } : null,
      referredBy: referredBy ? {
        affiliateNickname: referredBy.affiliate.nickname,
        affiliateEmail: referredBy.affiliate.email,
        affiliateCode: referredBy.affiliate.referralCode,
      } : null,
      referrals,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════════

  async getUserAuditLogs(userId: string, page = 1, limit = 20, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = {
      OR: [
        { userId },
        { resourceId: userId, resource: 'user' },
      ],
    };

    if (filters?.action) {
      where.action = filters.action;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          action: true,
          resource: true,
          resourceId: true,
          changes: true,
          ipAddress: true,
          createdAt: true,
          admin: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        changes: item.changes ? JSON.parse(item.changes) : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // USER ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════

  async getUserAchievements(userId: string) {
    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      select: {
        id: true,
        unlockedAt: true,
        rewardClaimed: true,
        achievement: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            conditionType: true,
            conditionValue: true,
            rewardGold: true,
          },
        },
      },
    });

    return achievements;
  }

  // ═══════════════════════════════════════════════════════════
  // DAILY TASK PROGRESS
  // ═══════════════════════════════════════════════════════════

  async getUserDailyTaskProgress(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    // Reset to start of day
    targetDate.setHours(0, 0, 0, 0);

    const progress = await this.prisma.userDailyTaskProgress.findMany({
      where: {
        userId,
        date: targetDate,
      },
      select: {
        id: true,
        currentCount: true,
        isCompleted: true,
        completedAt: true,
        rewardClaimed: true,
        date: true,
        task: {
          select: {
            id: true,
            name: true,
            description: true,
            taskType: true,
            targetCount: true,
            rewardGold: true,
          },
        },
      },
    });

    return progress;
  }

  // ═══════════════════════════════════════════════════════════
  // REMOVE VIP
  // ═══════════════════════════════════════════════════════════

  async removeUserVip(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(ADMIN_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { vipTier: null, vipExpiresAt: null },
      select: { id: true, email: true, vipTier: true, vipExpiresAt: true },
    });

    await this.adminService.invalidateUserCache(userId);
    await this.adminService.createAuditLog(adminId, ADMIN_CONSTANTS.AUDIT_ACTIONS.ADJUST_VIP, ADMIN_CONSTANTS.AUDIT_RESOURCES.USER, userId, {
      previousVipTier: user.vipTier,
      newVipTier: null,
      action: 'REMOVE_VIP',
    });

    return updated;
  }

  private calculateVipExpiry(currentExpiry: Date | null, extraDays: number): Date {
    const now = new Date();
    const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + extraDays);
    return newExpiry;
  }
}
