import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { Prisma } from '@prisma/client';
import {
  CreateDailyTaskDto,
  UpdateDailyTaskDto,
  CreateAchievementDto,
  UpdateAchievementDto,
  UpdateCheckInRewardDto,
} from './dto/gamification.dto';

@Injectable()
export class GamificationManagementService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════
  // DAILY TASKS
  // ═══════════════════════════════════════════════════════════

  async getDailyTasks(
    search?: string,
    isActive?: boolean,
    taskType?: string,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.DailyTaskWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (isActive !== undefined) where.isActive = isActive;
    if (taskType) where.taskType = taskType as any;

    const [data, total] = await Promise.all([
      this.prisma.dailyTask.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dailyTask.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDailyTaskById(id: string) {
    const task = await this.prisma.dailyTask.findUnique({
      where: { id },
      include: {
        _count: { select: { progress: true } },
      },
    });
    if (!task) throw new NotFoundException('Nhiệm vụ không tồn tại');
    return task;
  }

  async createDailyTask(dto: CreateDailyTaskDto) {
    return this.prisma.dailyTask.create({ data: dto });
  }

  async updateDailyTask(id: string, dto: UpdateDailyTaskDto) {
    await this.getDailyTaskById(id);
    return this.prisma.dailyTask.update({ where: { id }, data: dto });
  }

  async deleteDailyTask(id: string) {
    await this.getDailyTaskById(id);
    // Delete related progress first
    await this.prisma.userDailyTaskProgress.deleteMany({ where: { taskId: id } });
    return this.prisma.dailyTask.delete({ where: { id } });
  }

  async toggleDailyTask(id: string) {
    const task = await this.getDailyTaskById(id);
    return this.prisma.dailyTask.update({
      where: { id },
      data: { isActive: !task.isActive },
    });
  }

  async reorderDailyTasks(taskIds: string[]) {
    const updates = taskIds.map((id, index) =>
      this.prisma.dailyTask.update({ where: { id }, data: { sortOrder: index + 1 } }),
    );
    await this.prisma.$transaction(updates);
    return { success: true };
  }

  async getDailyTaskStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalTasks, activeTasks, todayCompletions, todayClaims] = await Promise.all([
      this.prisma.dailyTask.count(),
      this.prisma.dailyTask.count({ where: { isActive: true } }),
      this.prisma.userDailyTaskProgress.count({
        where: { date: { gte: today }, isCompleted: true },
      }),
      this.prisma.userDailyTaskProgress.count({
        where: { date: { gte: today }, rewardClaimed: true },
      }),
    ]);

    return { totalTasks, activeTasks, todayCompletions, todayClaims };
  }

  // ═══════════════════════════════════════════════════════════
  // ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════

  async getAchievements(
    search?: string,
    isActive?: boolean,
    category?: string,
    conditionType?: string,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.AchievementWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (isActive !== undefined) where.isActive = isActive;
    if (category) where.category = category;
    if (conditionType) where.conditionType = conditionType as any;

    const [data, total] = await Promise.all([
      this.prisma.achievement.findMany({
        where,
        include: {
          _count: { select: { userAchievements: true } },
        },
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.achievement.count({ where }),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAchievementById(id: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id },
      include: {
        _count: { select: { userAchievements: true } },
      },
    });
    if (!achievement) throw new NotFoundException('Thành tích không tồn tại');
    return achievement;
  }

  async createAchievement(dto: CreateAchievementDto) {
    return this.prisma.achievement.create({ data: dto });
  }

  async updateAchievement(id: string, dto: UpdateAchievementDto) {
    await this.getAchievementById(id);
    return this.prisma.achievement.update({ where: { id }, data: dto });
  }

  async deleteAchievement(id: string) {
    await this.getAchievementById(id);
    await this.prisma.userAchievement.deleteMany({ where: { achievementId: id } });
    return this.prisma.achievement.delete({ where: { id } });
  }

  async toggleAchievement(id: string) {
    const achievement = await this.getAchievementById(id);
    return this.prisma.achievement.update({
      where: { id },
      data: { isActive: !achievement.isActive },
    });
  }

  async getAchievementStats() {
    const [totalAchievements, activeAchievements, totalUnlocked] = await Promise.all([
      this.prisma.achievement.count(),
      this.prisma.achievement.count({ where: { isActive: true } }),
      this.prisma.userAchievement.count(),
    ]);

    // Top achievements by unlock count
    const topAchievements = await this.prisma.achievement.findMany({
      include: { _count: { select: { userAchievements: true } } },
      orderBy: { userAchievements: { _count: 'desc' } },
      take: 5,
    });

    return { totalAchievements, activeAchievements, totalUnlocked, topAchievements };
  }

  // ═══════════════════════════════════════════════════════════
  // CHECK-IN REWARDS
  // ═══════════════════════════════════════════════════════════

  async getCheckInRewards() {
    return this.prisma.checkInReward.findMany({
      orderBy: { day: 'asc' },
    });
  }

  async updateCheckInReward(dto: UpdateCheckInRewardDto) {
    return this.prisma.checkInReward.upsert({
      where: { day: dto.day },
      update: {
        rewardGold: dto.rewardGold,
        description: dto.description,
        isActive: dto.isActive,
      },
      create: {
        day: dto.day,
        rewardGold: dto.rewardGold,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async bulkUpdateCheckInRewards(rewards: UpdateCheckInRewardDto[]) {
    const updates = rewards.map((dto) =>
      this.prisma.checkInReward.upsert({
        where: { day: dto.day },
        update: {
          rewardGold: dto.rewardGold,
          description: dto.description,
          isActive: dto.isActive,
        },
        create: {
          day: dto.day,
          rewardGold: dto.rewardGold,
          description: dto.description,
          isActive: dto.isActive ?? true,
        },
      }),
    );
    await this.prisma.$transaction(updates);
    return this.getCheckInRewards();
  }

  async getCheckInStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalCheckIns, todayCheckIns, weekCheckIns, totalGoldGiven] = await Promise.all([
      this.prisma.checkIn.count(),
      this.prisma.checkIn.count({ where: { date: { gte: today } } }),
      this.prisma.checkIn.count({ where: { date: { gte: sevenDaysAgo } } }),
      this.prisma.checkIn.aggregate({ _sum: { rewardGold: true } }),
    ]);

    // Check-ins per day for last 7 days
    const dailyCheckIns = await this.prisma.checkIn.groupBy({
      by: ['date'],
      _count: true,
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' },
    });

    // Streak distribution
    const streakDistribution = await this.prisma.checkIn.groupBy({
      by: ['day'],
      _count: true,
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { day: 'asc' },
    });

    return {
      totalCheckIns,
      todayCheckIns,
      weekCheckIns,
      totalGoldGiven: totalGoldGiven._sum.rewardGold || 0,
      dailyCheckIns,
      streakDistribution,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // OVERVIEW STATS
  // ═══════════════════════════════════════════════════════════

  async getGamificationOverview() {
    const [taskStats, achievementStats, checkInStats] = await Promise.all([
      this.getDailyTaskStats(),
      this.getAchievementStats(),
      this.getCheckInStats(),
    ]);

    return {
      dailyTasks: taskStats,
      achievements: achievementStats,
      checkIns: checkInStats,
    };
  }
}
