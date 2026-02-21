import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class DailyTasksService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private walletService: WalletService,
  ) {}

  async trackWatchProgress(userId: string) {
    const lockKey = `daily_task_lock:${userId}`;
    const redis = this.redisService.getClient();

    // Acquire a per-user distributed lock to serialize concurrent requests.
    // Prisma upsert is not atomic (SELECT + INSERT/UPDATE), so without a lock
    // concurrent calls for the same user all race and fail with P2002.
    let lockAcquired = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      const result = await redis.set(lockKey, '1', 'PX', 10000, 'NX');
      if (result === 'OK') {
        lockAcquired = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50 + attempt * 10));
    }

    if (!lockAcquired) {
      // Could not acquire lock within ~1.9s — return current progress without incrementing
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const first = await this.prisma.userDailyTaskProgress.findFirst({
        where: { userId, date: today, task: { taskType: 'WATCH_VIDEO' } },
      });
      return { watchCount: first?.currentCount || 0, goldEarned: 0, milestones: [], claimedMilestones: [] };
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all WATCH_VIDEO type tasks
      const watchTasks = await this.prisma.dailyTask.findMany({
        where: { taskType: 'WATCH_VIDEO', isActive: true },
      });

      if (watchTasks.length === 0) return { watchCount: 0, goldEarned: 0, milestones: [], claimedMilestones: [] };

      let totalGoldEarned = 0;
      const milestones: number[] = [];
      const claimedMilestones: number[] = [];

      for (const task of watchTasks) {
        // Use upsert — atomic at the DB level, no race even without lock
        const progress = await this.prisma.userDailyTaskProgress.upsert({
          where: { userId_taskId_date: { userId, taskId: task.id, date: today } },
          update: { currentCount: { increment: 1 } },
          create: {
            userId,
            taskId: task.id,
            date: today,
            currentCount: 1,
            isCompleted: 1 >= task.targetCount,
          },
        });

        milestones.push(task.targetCount);

        // Check if task just completed
        if (!progress.isCompleted && progress.currentCount >= task.targetCount) {
          await this.prisma.userDailyTaskProgress.update({
            where: { id: progress.id },
            data: { isCompleted: true, completedAt: new Date(), rewardClaimed: true },
          });

          await this.walletService.addGold(userId, task.rewardGold, `Hoàn thành: ${task.name}`);
          totalGoldEarned += task.rewardGold;
          claimedMilestones.push(task.targetCount);
        } else if (progress.isCompleted) {
          claimedMilestones.push(task.targetCount);
        }
      }

      const firstProgress = await this.prisma.userDailyTaskProgress.findFirst({
        where: { userId, date: today, task: { taskType: 'WATCH_VIDEO' } },
      });

      return {
        watchCount: firstProgress?.currentCount || 1,
        goldEarned: totalGoldEarned,
        milestones,
        claimedMilestones,
      };
    } finally {
      await redis.del(lockKey);
    }
  }

  async getDailyTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get active tasks from database with cache
    const cacheKey = 'daily_tasks:active';
    let tasks = await this.redisService.get<any[]>(cacheKey);
    
    if (!tasks) {
      tasks = await this.prisma.dailyTask.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          taskType: true,
          targetCount: true,
          rewardGold: true,
        },
      });
      await this.redisService.set(cacheKey, tasks, 3600);
    }

    // Get user's progress for each task
    const progressRecords = await this.prisma.userDailyTaskProgress.findMany({
      where: {
        userId,
        date: today,
      },
    });

    const progressMap = new Map(progressRecords.map((p) => [p.taskId, p]));

    return {
      tasks: tasks.map((task) => {
        const progress = progressMap.get(task.id);
        return {
          id: task.id,
          name: task.name,
          target: task.targetCount,
          current: progress?.currentCount || 0,
          reward: task.rewardGold,
          completed: progress?.isCompleted || false,
        };
      }),
    };
  }
}
