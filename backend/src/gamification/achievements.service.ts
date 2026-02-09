import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';

@Injectable()
export class AchievementsService {
  private readonly achievements = [
    { id: 'first_comment', name: 'Bình luận đầu tiên', description: 'Viết bình luận đầu tiên', reward: 10 },
    { id: 'watch_10', name: 'Người xem chăm chỉ', description: 'Xem 10 tập phim', reward: 20 },
    { id: 'watch_50', name: 'Fan cuồng', description: 'Xem 50 tập phim', reward: 50 },
    { id: 'watch_100', name: 'Collector', description: 'Xem 100 tập phim', reward: 100 },
    { id: 'streak_7', name: 'Điểm danh 7 ngày', description: 'Điểm danh liên tục 7 ngày', reward: 30 },
    { id: 'first_share', name: 'Người chia sẻ', description: 'Chia sẻ phim lần đầu', reward: 10 },
    { id: 'first_rating', name: 'Nhà phê bình', description: 'Đánh giá phim lần đầu', reward: 10 },
  ];

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getAchievements(userId: string) {
    const claimedKey = `achievements:${userId}`;
    const claimed = await this.redisService.get<string[]>(claimedKey) || [];

    return this.achievements.map((a) => ({
      ...a,
      claimed: claimed.includes(a.id),
    }));
  }

  async checkAndAward(userId: string, achievementId: string): Promise<boolean> {
    const claimedKey = `achievements:${userId}`;
    const claimed = await this.redisService.get<string[]>(claimedKey) || [];

    if (claimed.includes(achievementId)) return false;

    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement) return false;

    claimed.push(achievementId);
    await this.redisService.set(claimedKey, claimed);

    return true;
  }
}
