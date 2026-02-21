import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { R2StorageService } from '../../admin/videos/services/r2-storage.service';
import { UpdateProfileDto, UserQueryDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private r2StorageService: R2StorageService,
  ) {}

  async findById(id: string) {
    const cached = await this.redisService.get(`user:${id}`);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, nickname: true, firstName: true, lastName: true, avatar: true,
        phone: true, dateOfBirth: true, gender: true, vipTier: true, vipExpiresAt: true,
        goldBalance: true, isEmailVerified: true, isActive: true, country: true, language: true,
        createdAt: true, lastLoginAt: true,
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    await this.redisService.set(`user:${id}`, user, 300);
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
      select: {
        id: true, email: true, nickname: true, firstName: true, lastName: true, avatar: true,
        phone: true, dateOfBirth: true, gender: true, vipTier: true, vipExpiresAt: true,
        goldBalance: true, isEmailVerified: true, country: true, language: true,
        createdAt: true, updatedAt: true,
      },
    });
    await this.redisService.del(`user:${userId}`);
    return user;
  }

  async findAll(query: UserQueryDto) {
    const { search, page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { nickname: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }
    return this.prisma.paginate('user', { page, limit, where, orderBy: { [sort]: order } });
  }

  async getWatchHistory(userId: string, page = 1, limit = 20) {
    return this.prisma.paginate('watchHistory', {
      page, limit,
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { video: { select: { id: true, title: true, slug: true, poster: true, duration: true } } },
    });
  }

  async getFavorites(userId: string, page = 1, limit = 20) {
    return this.prisma.paginate('favorite', {
      page, limit,
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { video: { select: { id: true, title: true, slug: true, poster: true, viewCount: true, ratingAverage: true } } },
    });
  }

  async toggleFavorite(userId: string, videoId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { isFavorited: false };
    }
    await this.prisma.favorite.create({ data: { userId, videoId } });
    return { isFavorited: true };
  }

  async lockUser(userId: string, reason: string, lockedBy: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: true, lockReason: reason, lockedAt: new Date(), lockedBy },
    });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.redisService.del(`user:${userId}`);
  }

  async unlockUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: false, lockReason: null, lockedAt: null, lockedBy: null },
    });
    await this.redisService.del(`user:${userId}`);
  }

  async getUserStats(userId: string) {
    const [watchCount, favoriteCount, commentCount, transactionCount] = await Promise.all([
      this.prisma.watchHistory.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId } }),
      this.prisma.comment.count({ where: { userId } }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);
    return { watchCount, favoriteCount, commentCount, transactionCount };
  }

  /**
   * Upload avatar to R2 storage and return the public URL
   */
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ url: string }> {
    try {
      const ext = this.getExtFromContentType(file.mimetype);
      const avatarKey = `cdn/avatars/${userId}/avatar.${ext}`;

      // Upload buffer to R2 storage
      const url = await this.r2StorageService.uploadBuffer(
        avatarKey,
        file.buffer,
        file.mimetype,
      );

      return { url };
    } catch (error) {
      throw error;
    }
  }

  private getExtFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return map[contentType] || 'jpg';
  }
}
