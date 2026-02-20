import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';

@Injectable()
export class AchievementsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getAchievements(userId: string) {
    // Get achievements from database with cache
    const cacheKey = 'achievements:all';
    let achievements = await this.redisService.get<any[]>(cacheKey);
    
    if (!achievements) {
      achievements = await this.prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          conditionType: true,
          conditionValue: true,
          rewardGold: true,
        },
      });
      await this.redisService.set(cacheKey, achievements, 3600);
    }

    // Get user's claimed achievements
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId, rewardClaimed: true },
      select: { achievementId: true },
    });
    const claimedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return achievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description || '',
      category: a.category || 'watch',
      reward: a.rewardGold,
      claimed: claimedIds.has(a.id),
    }));
  }

  async checkAndAward(userId: string, achievementId: string): Promise<boolean> {
    // Check if achievement exists and is active
    const achievement = await this.prisma.achievement.findFirst({
      where: { id: achievementId, isActive: true },
    });
    if (!achievement) return false;

    // Check if already claimed
    const existing = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });
    if (existing?.rewardClaimed) return false;

    // Create or update user achievement
    await this.prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId } },
      create: {
        userId,
        achievementId,
        rewardClaimed: true,
      },
      update: {
        rewardClaimed: true,
      },
    });

    return true;
  }
}
