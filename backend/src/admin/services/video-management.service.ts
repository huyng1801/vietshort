import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class VideoManagementService {
  constructor(private prisma: PrismaService) {}

  async getVideosForReview(page = 1, limit = 20) {
    return this.prisma.paginate('video', {
      page, limit,
      where: { status: 'DRAFT' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveVideo(videoId: string) {
    return this.prisma.video.update({
      where: { id: videoId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async rejectVideo(videoId: string, reason?: string) {
    return this.prisma.video.update({
      where: { id: videoId },
      data: { status: 'ARCHIVED' },
    });
  }

  async getAllVideos(page = 1, limit = 20, status?: string) {
    const where = status ? { status } : {};
    return this.prisma.paginate('video', { page, limit, where, orderBy: { createdAt: 'desc' } });
  }

  async deleteVideo(videoId: string) {
    return this.prisma.video.update({
      where: { id: videoId },
      data: { status: 'DELETED' },
    });
  }
}
