import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { VideoStatus } from '@prisma/client';
import { ADMIN_CONSTANTS, ADMIN_ERROR_MESSAGES } from '../core/constants/admin.constants';
import { AdminService } from '../core/admin.service';

@Injectable()
export class VideoManagementService {
  constructor(
    private prisma: PrismaService,
    private adminService: AdminService,
  ) {}

  async getVideosForReview(page?: number, limit?: number) {
    const actualPage = page || ADMIN_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const actualLimit = limit || ADMIN_CONSTANTS.PAGINATION.DEFAULT_LIMIT;
    return this.prisma.paginate('video', {
      page: actualPage,
      limit: actualLimit,
      where: { status: VideoStatus.DRAFT },
      orderBy: { createdAt: 'desc' },
      include: { episodes: { select: { id: true, episodeNumber: true, encodingStatus: true } } },
    });
  }

  async approveVideo(videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException(ADMIN_ERROR_MESSAGES.VIDEO_NOT_FOUND);
    }
    if (video.status !== VideoStatus.DRAFT) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGES.VIDEO_NOT_DRAFT);
    }

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.PUBLISHED, publishedAt: new Date() },
    });

    await this.adminService.invalidateVideoCache(videoId);
    await this.adminService.createAuditLog(
      null,
      ADMIN_CONSTANTS.AUDIT_ACTIONS.APPROVE_VIDEO,
      ADMIN_CONSTANTS.AUDIT_RESOURCES.VIDEO,
      videoId,
      { title: video.title },
    );
    return updated;
  }

  async rejectVideo(videoId: string, reason: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException(ADMIN_ERROR_MESSAGES.VIDEO_NOT_FOUND);
    }

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.ARCHIVED },
    });

    await this.adminService.invalidateVideoCache(videoId);
    await this.adminService.createAuditLog(
      null,
      ADMIN_CONSTANTS.AUDIT_ACTIONS.REJECT_VIDEO,
      ADMIN_CONSTANTS.AUDIT_RESOURCES.VIDEO,
      videoId,
      { title: video.title, reason },
    );
    return updated;
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
