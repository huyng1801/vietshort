import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: { userId, videoId: dto.videoId, parentId: dto.parentId, content: dto.content },
      include: { user: { select: { id: true, nickname: true, avatar: true, vipTier: true } } },
    });
  }

  async findByVideo(videoId: string, page = 1, limit = 20) {
    return this.prisma.paginate('comment', {
      page, limit,
      where: { videoId, parentId: null, isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, avatar: true, vipTier: true } },
        replies: {
          where: { isApproved: true },
          include: { user: { select: { id: true, nickname: true, avatar: true, vipTier: true } } },
          orderBy: { createdAt: 'asc' },
          take: 3,
        },
        _count: { select: { replies: true } },
      },
    });
  }

  async getReplies(parentId: string, page = 1, limit = 20) {
    return this.prisma.paginate('comment', {
      page, limit,
      where: { parentId, isApproved: true },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, nickname: true, avatar: true, vipTier: true } } },
    });
  }

  async update(userId: string, commentId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (comment.userId !== userId) throw new ForbiddenException('Bạn không có quyền sửa bình luận này');
    return this.prisma.comment.update({ where: { id: commentId }, data: { content: dto.content } });
  }

  async delete(userId: string, commentId: string, isAdmin = false) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (!isAdmin && comment.userId !== userId) throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    await this.prisma.comment.delete({ where: { id: commentId } });
  }

  async report(userId: string, commentId: string) {
    await this.prisma.comment.update({ where: { id: commentId }, data: { isReported: true } });
  }

  async moderate(adminId: string, commentId: string, approved: boolean) {
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isApproved: approved, moderatedBy: adminId, moderatedAt: new Date() },
    });
  }
}
