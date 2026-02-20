import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { WalletService } from '../wallet/wallet.service';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class DailyCheckInService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private redisService: RedisService,
  ) {}

  async checkIn(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.checkIn.findFirst({
      where: { userId, date: { gte: today } },
    });
    if (existing) return { success: false, message: 'Đã điểm danh hôm nay' };

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastCheckIn = await this.prisma.checkIn.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    let day = 1;
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn.date);
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() === yesterday.getTime()) {
        day = lastCheckIn.day + 1;
      }
    }
    if (day > 7) day = 1;

    // Fetch reward from database
    const rewardConfig = await this.getRewardForDay(day);
    const goldReward = rewardConfig?.rewardGold || 5;

    const checkIn = await this.prisma.checkIn.create({
      data: { userId, date: new Date(), day, rewardGold: goldReward },
    });

    await this.walletService.addGold(userId, goldReward, `Điểm danh ngày ${day}`);
    return { success: true, day, goldReward, checkIn };
  }

  async getHistory(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.prisma.checkIn.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'desc' },
    });
  }

  async getStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCheckIn = await this.prisma.checkIn.findFirst({
      where: { userId, date: { gte: today } },
    });
    const lastCheckIn = await this.prisma.checkIn.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return { checkedInToday: !!todayCheckIn, currentStreak: lastCheckIn?.day || 0 };
  }

  async getRewards() {
    const cacheKey = 'checkin:rewards';
    const cached = await this.redisService.get<any[]>(cacheKey);
    if (cached) return cached;

    const rewards = await this.prisma.checkInReward.findMany({
      where: { isActive: true },
      orderBy: { day: 'asc' },
      select: {
        id: true,
        day: true,
        rewardGold: true,
        description: true,
      },
    });

    await this.redisService.set(cacheKey, rewards, 3600);
    return rewards;
  }

  private async getRewardForDay(day: number) {
    const cacheKey = `checkin:reward:${day}`;
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) return cached;

    const reward = await this.prisma.checkInReward.findFirst({
      where: { day, isActive: true },
    });

    if (reward) {
      await this.redisService.set(cacheKey, reward, 3600);
    }
    return reward;
  }
}
