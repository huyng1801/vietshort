import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class DailyCheckInService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
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

    const rewards = [0, 5, 5, 10, 10, 15, 15, 30];
    const goldReward = rewards[day] || 5;

    const checkIn = await this.prisma.checkIn.create({
      data: { userId, date: new Date(), day, reward: JSON.stringify({ gold: goldReward }) },
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
}
