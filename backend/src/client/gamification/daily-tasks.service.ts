import { Injectable } from '@nestjs/common';
import { RedisService } from '../../config/redis.config';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class DailyTasksService {
  constructor(
    private redisService: RedisService,
    private walletService: WalletService,
  ) {}

  async trackWatchProgress(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_watch:${userId}:${today}`;

    const count = await this.redisService.get<number>(key);
    const current = count ? Number(count) + 1 : 1;
    await this.redisService.set(key, current.toString(), 86400);

    const milestones = [3, 5, 10];
    const rewards = [10, 15, 25];
    let reward = 0;
    const claimedKey = `daily_watch_claimed:${userId}:${today}`;
    const claimed = await this.redisService.get<number[]>(claimedKey);
    const claimedMilestones: number[] = claimed ? claimed : [];

    for (let i = 0; i < milestones.length; i++) {
      if (current >= milestones[i] && !claimedMilestones.includes(milestones[i])) {
        reward += rewards[i];
        claimedMilestones.push(milestones[i]);
      }
    }

    if (reward > 0) {
      await this.walletService.addGold(userId, reward, `Xem ${current} tập hôm nay`);
      await this.redisService.set(claimedKey, JSON.stringify(claimedMilestones), 86400);
    }

    return { watchCount: current, goldEarned: reward, milestones, claimedMilestones };
  }

  async getDailyTasks(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const watchKey = `daily_watch:${userId}:${today}`;
    const claimedKey = `daily_watch_claimed:${userId}:${today}`;

    const watchCount = await this.redisService.get<number>(watchKey);
    const claimed = await this.redisService.get<number[]>(claimedKey);

    return {
      tasks: [
        { id: 'watch_3', name: 'Xem 3 tập', target: 3, current: watchCount ? Number(watchCount) : 0, reward: 10, completed: claimed?.includes(3) || false },
        { id: 'watch_5', name: 'Xem 5 tập', target: 5, current: watchCount ? Number(watchCount) : 0, reward: 15, completed: claimed?.includes(5) || false },
        { id: 'watch_10', name: 'Xem 10 tập', target: 10, current: watchCount ? Number(watchCount) : 0, reward: 25, completed: claimed?.includes(10) || false },
      ],
    };
  }
}
