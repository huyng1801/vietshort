import { PrismaService } from '../../../config/database.config';

export class ViewsReport {
  constructor(private prisma: PrismaService) {}

  async getTopVideosByViews(limit = 20, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: { id: true, title: true, poster: true, viewCount: true, likeCount: true, ratingAverage: true },
    });
  }

  async getViewTrend(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.watchHistory.groupBy({
      by: ['videoId'],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { videoId: 'desc' } },
      take: 50,
    });
  }
}
