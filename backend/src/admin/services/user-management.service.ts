import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class UserManagementService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getUsers(search?: string, page = 1, limit = 20) {
    const where = search ? {
      OR: [
        { email: { contains: search } },
        { nickname: { contains: search } },
        { firstName: { contains: search } },
      ],
    } : {};
    return this.prisma.paginate('user', { page, limit, where, orderBy: { createdAt: 'desc' } });
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { ratings: true, comments: true, transactions: true } } },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async lockUser(userId: string, reason: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { isLocked: true, lockReason: reason } });
    await this.redisService.del(`user:${userId}`);
    return { success: true };
  }

  async unlockUser(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { isLocked: false, lockReason: null } });
    return { success: true };
  }

  async updateUserBalance(userId: string, goldBalance: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { goldBalance },
      select: { id: true, nickname: true, goldBalance: true },
    });
  }
}
