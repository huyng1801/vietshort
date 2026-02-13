import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { WalletService } from '../wallet/wallet.service';
import { UnlockMethod, VipType } from '@prisma/client';

@Injectable()
export class UnlockService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async checkAccess(userId: string, episodeId: string) {
    // Check if already unlocked
    const unlock = await this.prisma.videoUnlock.findUnique({
      where: { userId_episodeId: { userId, episodeId } },
    });
    if (unlock) return { hasAccess: true, method: unlock.method };

    // Check episode info
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { video: { select: { isVipOnly: true, vipTier: true } } },
    });
    if (!episode) throw new BadRequestException('Tập phim không tồn tại');
    
    // Free episodes have no unlock price - automatically accessible
    if (episode.unlockPrice === null) return { hasAccess: true };

    // Check VIP access
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user && episode.video.isVipOnly) {
      const hasVip = user.vipTier !== null && user.vipExpiresAt && user.vipExpiresAt > new Date();
      if (hasVip) {
        await this.prisma.videoUnlock.create({
          data: { userId, episodeId, method: UnlockMethod.VIP },
        });
        return { hasAccess: true, method: UnlockMethod.VIP };
      }
    }

    return { hasAccess: false, unlockPrice: episode.unlockPrice || episode.video?.isVipOnly ? 10 : 5 };
  }

  async unlockWithGold(userId: string, episodeId: string) {
    const access = await this.checkAccess(userId, episodeId);
    if (access.hasAccess) return { success: true, message: 'Đã mở khóa' };

    const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
    const price = episode?.unlockPrice || 5;

    await this.walletService.spendGold(userId, price, `Mở khóa tập ${episode?.episodeNumber}`, episodeId);

    await this.prisma.videoUnlock.create({
      data: { userId, episodeId, method: UnlockMethod.GOLD, goldSpent: price },
    });

    return { success: true, goldSpent: price };
  }
}
