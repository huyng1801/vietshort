import { PrismaService } from '../../config/database.config';

export class CollaborativeFilter {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: string, limit = 10): Promise<string[]> {
    // Find users with similar watch history
    const userHistory = await this.prisma.watchHistory.findMany({
      where: { userId },
      select: { videoId: true },
      take: 50,
    });

    const watchedVideoIds = userHistory.map((h) => h.videoId);
    if (watchedVideoIds.length === 0) return [];

    // Find users who watched the same videos
    const similarUsers = await this.prisma.watchHistory.groupBy({
      by: ['userId'],
      where: { videoId: { in: watchedVideoIds }, userId: { not: userId } },
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 20,
    });

    const similarUserIds = similarUsers.map((u) => u.userId).filter((id): id is string => id !== null);

    // Recommend videos that similar users watched but current user hasn't
    const recommendations = await this.prisma.watchHistory.findMany({
      where: { userId: { in: similarUserIds }, videoId: { notIn: watchedVideoIds.filter((id): id is string => id !== null) } },
      select: { videoId: true },
      distinct: ['videoId'],
      take: limit,
    });

    return recommendations.map((r) => r.videoId);
  }
}
