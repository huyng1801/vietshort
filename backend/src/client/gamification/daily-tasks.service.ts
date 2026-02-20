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
      // Get or create progress record with race condition handling
      let progress;
      try {
        progress = await this.prisma.userDailyTaskProgress.upsert({
          where: {
            userId_taskId_date: {
              userId,
              taskId: task.id,
              date: today,
            },
          },
          create: {
            userId,
            taskId: task.id,
            date: today,
            currentCount: 1,
            isCompleted: 1 >= task.targetCount,
          },
          update: {
            currentCount: { increment: 1 },
          },
        });
      } catch (error: any) {
        // Handle race condition: if unique constraint fails, just fetch and update
        if (error.code === 'P2002') {
          progress = await this.prisma.userDailyTaskProgress.findUnique({
            where: {
              userId_taskId_date: {
                userId,
                taskId: task.id,
                date: today,
              },
            },
          });
          
          if (progress) {
            progress = await this.prisma.userDailyTaskProgress.update({
              where: { id: progress.id },
              data: {
                currentCount: { increment: 1 },
              },
            });
          } else {
            // Fallback: create if somehow still doesn't exist
            progress = await this.prisma.userDailyTaskProgress.create({
              data: {
                userId,
                taskId: task.id,
                date: today,
                currentCount: 1,
                isCompleted: 1 >= task.targetCount,
              },
            });
          }
        } else {
          throw error;
        }
      }

      milestones.push(task.targetCount);

      // Check if task just completed (progress.currentCount is already incremented)
      if (!progress.isCompleted && progress.currentCount >= task.targetCount) {
        // Update completion status and claim reward
        await this.prisma.userDailyTaskProgress.update({
          where: { id: progress.id },
          data: {
            isCompleted: true,
            completedAt: new Date(),
            rewardClaimed: true,
          },
        });

        // Award gold
        await this.walletService.addGold(userId, task.rewardGold, `Hoàn thành: ${task.name}`);
        totalGoldEarned += task.rewardGold;
        claimedMilestones.push(task.targetCount);
      } else if (progress.isCompleted) {
        claimedMilestones.push(task.targetCount);
      }
    }

    // Get current watch count from first task
    const firstProgress = await this.prisma.userDailyTaskProgress.findFirst({
      where: {
        userId,
        date: today,
        task: { taskType: 'WATCH_VIDEO' },
      },
    });

    return {
      watchCount: firstProgress?.currentCount || 1,
      goldEarned: totalGoldEarned,
      milestones,
      claimedMilestones,
    };
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
