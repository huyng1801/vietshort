import { PrismaService } from '../../../config/database.config';

export class HistoryBasedRecommender {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: string, limit = 10): Promise<string[]> {
    // Get user's recently watched videos to extract preferences
    const recentWatched = await this.prisma.watchHistory.findMany({
      where: { userId },
      include: { video: { select: { genres: true, country: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    if (recentWatched.length === 0) return [];

    // Extract genre and country preferences
    const genres = recentWatched
      .map((w) => w.video.genres)
      .filter(Boolean) as string[];
    const countries = recentWatched
      .map((w) => w.video.country)
      .filter(Boolean) as string[];

    const watchedIds = recentWatched.map((w) => w.videoId);

    // Find similar videos based on genres and country
    const recommendations = await this.prisma.video.findMany({
      where: {
        id: { notIn: watchedIds },
        status: 'PUBLISHED',
        OR: [
          ...(genres.length > 0 ? genres.map((g) => ({ genres: { contains: g } })) : []),
          ...(countries.length > 0 ? [{ country: { in: countries } }] : []),
        ],
      },
      orderBy: [{ ratingAverage: 'desc' }, { viewCount: 'desc' }],
      take: limit,
      select: { id: true },
    });

    return recommendations.map((r) => r.id);
  }

  async getSimilarVideos(videoId: string, limit = 10): Promise<string[]> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { genres: true, country: true },
    });

    if (!video) return [];

    const similar = await this.prisma.video.findMany({
      where: {
        id: { not: videoId },
        status: 'PUBLISHED',
        OR: [
          ...(video.genres ? [{ genres: { contains: video.genres } }] : []),
          ...(video.country ? [{ country: video.country }] : []),
        ],
      },
      orderBy: [{ ratingAverage: 'desc' }, { viewCount: 'desc' }],
      take: limit,
      select: { id: true },
    });

    return similar.map((s) => s.id);
  }
}
