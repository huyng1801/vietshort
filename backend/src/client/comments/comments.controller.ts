import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { Public, CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get('video/:videoId')
  @ApiOperation({ summary: 'Lấy bình luận theo video' })
  async findByVideo(@Param('videoId') videoId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.commentsService.findByVideo(videoId, page, limit);
  }

  @Public()
  @Get(':id/replies')
  @ApiOperation({ summary: 'Lấy phản hồi bình luận' })
  async getReplies(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.commentsService.getReplies(id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Tạo bình luận' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Sửa bình luận' })
  async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentsService.update(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Xóa bình luận' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.delete(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Báo cáo bình luận' })
  async report(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.report(userId, id);
  }
}
