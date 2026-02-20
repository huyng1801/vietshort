import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class SocialManagementService {
  private readonly logger = new Logger(SocialManagementService.name);

  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════
  // COMMENTS MANAGEMENT
  // ═══════════════════════════════════════════════════

  async getComments(
    search?: string,
    videoId?: string,
    userId?: string,
    isApproved?: string,
    isReported?: string,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (videoId) where.videoId = videoId;
    if (userId) where.userId = userId;
    if (isApproved !== undefined) where.isApproved = isApproved === 'true';
    if (isReported !== undefined) where.isReported = isReported === 'true';
    
    // Search across: user nickname, video title, comment content
    if (search && search.trim()) {
      where.OR = [
        { content: { contains: search } },
        { user: { nickname: { contains: search } } },
        { video: { title: { contains: search } } },
      ];
    }

    const orderBy: any = {};
    const allowedSorts = ['createdAt', 'reportCount', 'likeCount'];
    orderBy[allowedSorts.includes(sortBy) ? sortBy : 'createdAt'] = sortOrder;

    // When using nested relation filters in OR, count() doesn't work
    // So we need to get the total count differently
    let total: number;
    if (search) {
      // For search queries with nested relations, get all matching IDs to count
      const allMatchingIds = await this.prisma.comment.findMany({
        where,
        select: { id: true },
      });
      total = allMatchingIds.length;
    } else {
      // For simple queries, use count()
      total = await this.prisma.comment.count({ where });
    }

    const comments = await this.prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: { select: { id: true, nickname: true, avatar: true, email: true } },
        video: { select: { id: true, title: true, slug: true } },
        parent: {
          select: { id: true, content: true, user: { select: { nickname: true } } },
        },
        _count: { select: { replies: true } },
      },
    });

    return {
      data: comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getCommentById(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true, email: true } },
        video: { select: { id: true, title: true, slug: true } },
        parent: {
          select: { id: true, content: true, user: { select: { nickname: true } } },
        },
        replies: {
          include: {
            user: { select: { id: true, nickname: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    return comment;
  }

  async moderateComment(adminId: string, commentId: string, isApproved: boolean) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isApproved,
        isReported: isApproved ? false : comment.isReported,
        moderatedBy: adminId,
        moderatedAt: new Date(),
      },
    });
  }

  async bulkModerateComments(adminId: string, ids: string[], isApproved: boolean) {
    const result = await this.prisma.comment.updateMany({
      where: { id: { in: ids } },
      data: {
        isApproved,
        moderatedBy: adminId,
        moderatedAt: new Date(),
      },
    });
    return { updated: result.count };
  }

  async deleteComment(commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    // Delete replies first, then the comment
    await this.prisma.comment.deleteMany({ where: { parentId: commentId } });
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { success: true };
  }

  async bulkDeleteComments(ids: string[]) {
    // Delete replies of these comments first
    await this.prisma.comment.deleteMany({ where: { parentId: { in: ids } } });
    const result = await this.prisma.comment.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count };
  }

  async getCommentStats() {
    const [total, approved, pending, reported] = await Promise.all([
      this.prisma.comment.count(),
      this.prisma.comment.count({ where: { isApproved: true } }),
      this.prisma.comment.count({ where: { isApproved: false } }),
      this.prisma.comment.count({ where: { isReported: true } }),
    ]);

    // Top commented videos
    const topCommentedVideos = await this.prisma.video.findMany({
      orderBy: { commentCount: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        commentCount: true,
        poster: true,
      },
    });

    return {
      total,
      approved,
      pending,
      reported,
      topCommentedVideos,
    };
  }

  // ═══════════════════════════════════════════════════
  // RATINGS MANAGEMENT
  // ═══════════════════════════════════════════════════

  async getRatings(
    videoId?: string,
    userId?: string,
    search?: string,
    rating?: number,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Search across: user nickname, video title, rating review
    // Only use search param, ignore videoId and userId filters
    if (search && search.trim()) {
      where.OR = [
        { user: { nickname: { contains: search } } },
        { video: { title: { contains: search } } },
        { review: { contains: search } },
      ];
    }

    const orderBy: any = {};
    const allowedSorts = ['createdAt', 'rating'];
    orderBy[allowedSorts.includes(sortBy) ? sortBy : 'createdAt'] = sortOrder;

    // When using nested relation filters in OR, count() doesn't work
    // So we need to get the total count differently
    let total: number;
    if (search) {
      // For search queries with nested relations, get all matching IDs to count
      const allMatchingIds = await this.prisma.rating.findMany({
        where,
        select: { id: true },
      });
      total = allMatchingIds.length;
    } else {
      // For simple queries, use count()
      total = await this.prisma.rating.count({ where });
    }

    const ratings = await this.prisma.rating.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: { select: { id: true, nickname: true, avatar: true, email: true, vipTier: true } },
        video: { select: { id: true, title: true, slug: true, poster: true, ratingAverage: true, ratingCount: true } },
      },
    });

    return {
      data: ratings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async deleteRating(ratingId: string) {
    const rating = await this.prisma.rating.findUnique({ where: { id: ratingId } });
    if (!rating) throw new NotFoundException('Đánh giá không tồn tại');

    // Delete rating and recalculate video average
    await this.prisma.rating.delete({ where: { id: ratingId } });

    // Recalculate video rating
    const videoRatings = await this.prisma.rating.aggregate({
      where: { videoId: rating.videoId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.video.update({
      where: { id: rating.videoId },
      data: {
        ratingAverage: videoRatings._avg.rating || 0,
        ratingCount: videoRatings._count.rating || 0,
      },
    });

    return { success: true };
  }

  async getRatingDistribution(videoId?: string) {
    const where: any = videoId ? { videoId } : {};

    const distribution = await Promise.all(
      [1, 2, 3, 4, 5].map(async (star) => {
        const count = await this.prisma.rating.count({
          where: { ...where, rating: star },
        });
        return { star, count };
      }),
    );

    const totalRatings = distribution.reduce((sum, d) => sum + d.count, 0);
    const averageRating =
      totalRatings > 0
        ? distribution.reduce((sum, d) => sum + d.star * d.count, 0) / totalRatings
        : 0;

    return {
      distribution,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  async getRatingStats() {
    const total = await this.prisma.rating.count();
    const distribution = await this.getRatingDistribution();

    // Top rated videos
    const topRatedVideos = await this.prisma.video.findMany({
      where: { ratingCount: { gt: 0 } },
      orderBy: { ratingAverage: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        poster: true,
        ratingAverage: true,
        ratingCount: true,
      },
    });

    return {
      total,
      ...distribution,
      topRatedVideos,
    };
  }

  // ═══════════════════════════════════════════════════
  // VIDEO INTERACTIONS (FAVORITES + LIKES)
  // ═══════════════════════════════════════════════════

  async getVideoInteractions(search?: string, page = 1, limit = 20, sortBy = 'totalInteractions', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;

    // Get videos with both favorites and likes
    const where: any = {
      OR: [
        { favoriteCount: { gt: 0 } },
        { likeCount: { gt: 0 } },
      ],
    };
    
    if (search) {
      where.title = { contains: search };
    }

    // Map sortBy to actual field
    let actualSortField = 'createdAt';
    if (sortBy === 'totalInteractions') {
      // We'll sort this in memory after fetching
      actualSortField = 'favoriteCount';
    } else if (['favoriteCount', 'likeCount', 'viewCount', 'createdAt'].includes(sortBy)) {
      actualSortField = sortBy;
    }

    const orderBy: any = {};
    orderBy[actualSortField] = sortOrder;

    const [videosRaw, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip: sortBy === 'totalInteractions' ? 0 : skip, // Fetch all if sorting by total
        take: sortBy === 'totalInteractions' ? undefined : limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          poster: true,
          favoriteCount: true,
          likeCount: true,
          viewCount: true,
          commentCount: true,
          ratingAverage: true,
          ratingCount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    // Add totalInteractions field and sort if needed
    let videos = videosRaw.map((v) => ({
      ...v,
      totalInteractions: v.favoriteCount + v.likeCount,
    }));

    if (sortBy === 'totalInteractions') {
      videos.sort((a, b) => {
        const diff = a.totalInteractions - b.totalInteractions;
        return sortOrder === 'asc' ? diff : -diff;
      });
      // Apply pagination after sorting
      videos = videos.slice(skip, skip + limit);
    }

    return {
      data: videos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════
  // FAVORITES MANAGEMENT
  // ═══════════════════════════════════════════════════

  async getFavoriteStats(search?: string, page = 1, limit = 20, sortBy = 'favoriteCount', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;

    const where: any = { favoriteCount: { gt: 0 } };
    if (search) {
      where.title = { contains: search };
    }

    const orderBy: any = {};
    const allowedSorts = ['favoriteCount', 'likeCount', 'viewCount', 'createdAt'];
    orderBy[allowedSorts.includes(sortBy) ? sortBy : 'favoriteCount'] = sortOrder;

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          poster: true,
          favoriteCount: true,
          likeCount: true,
          viewCount: true,
          commentCount: true,
          ratingAverage: true,
          ratingCount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    return {
      data: videos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getVideoFavorites(videoId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { videoId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true, avatar: true, email: true } },
        },
      }),
      this.prisma.favorite.count({ where: { videoId } }),
    ]);

    return {
      data: favorites,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════
  // LIKES MANAGEMENT
  // ═══════════════════════════════════════════════════

  async getLikeStats(search?: string, page = 1, limit = 20, sortBy = 'likeCount', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;

    const where: any = { likeCount: { gt: 0 } };
    if (search) {
      where.title = { contains: search };
    }

    const orderBy: any = {};
    const allowedSorts = ['likeCount', 'favoriteCount', 'viewCount', 'createdAt'];
    orderBy[allowedSorts.includes(sortBy) ? sortBy : 'likeCount'] = sortOrder;

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          poster: true,
          likeCount: true,
          favoriteCount: true,
          viewCount: true,
          commentCount: true,
          ratingAverage: true,
          ratingCount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    return {
      data: videos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getVideoLikes(videoId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { videoId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true, avatar: true, email: true } },
        },
      }),
      this.prisma.like.count({ where: { videoId } }),
    ]);

    return {
      data: likes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════
  // SOCIAL OVERVIEW
  // ═══════════════════════════════════════════════════

  async getSocialOverview() {
    const [
      totalComments,
      reportedComments,
      pendingComments,
      totalRatings,
      totalFavorites,
      totalLikes,
    ] = await Promise.all([
      this.prisma.comment.count(),
      this.prisma.comment.count({ where: { isReported: true } }),
      this.prisma.comment.count({ where: { isApproved: false } }),
      this.prisma.rating.count(),
      this.prisma.favorite.count(),
      this.prisma.like.count(),
    ]);

    // Today's counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayComments, todayRatings, todayFavorites, todayLikes] = await Promise.all([
      this.prisma.comment.count({ where: { createdAt: { gte: today } } }),
      this.prisma.rating.count({ where: { createdAt: { gte: today } } }),
      this.prisma.favorite.count({ where: { createdAt: { gte: today } } }),
      this.prisma.like.count({ where: { createdAt: { gte: today } } }),
    ]);

    return {
      comments: { total: totalComments, reported: reportedComments, pending: pendingComments, today: todayComments },
      ratings: { total: totalRatings, today: todayRatings },
      favorites: { total: totalFavorites, today: todayFavorites },
      likes: { total: totalLikes, today: todayLikes },
    };
  }
}
