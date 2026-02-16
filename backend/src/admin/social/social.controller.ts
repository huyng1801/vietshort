import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialManagementService } from './social-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import {
  QueryCommentsDto,
  ModerateCommentDto,
  BulkModerateDto,
  QueryRatingsDto,
  QueryFavoritesDto,
  QueryLikesDto,
} from './dto/social-management.dto';

@ApiTags('admin/social')
@Controller('admin/social')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminSocialController {
  constructor(private readonly socialService: SocialManagementService) {}

  // ═══ Overview ═══

  @Get('overview')
  @ApiOperation({ summary: 'Tổng quan tương tác xã hội' })
  async getSocialOverview() {
    return this.socialService.getSocialOverview();
  }

  // ═══ Comments ═══

  @Get('comments')
  @ApiOperation({ summary: 'Danh sách bình luận' })
  async getComments(@Query() query: QueryCommentsDto) {
    return this.socialService.getComments(
      query.search,
      query.videoId,
      query.userId,
      query.isApproved,
      query.isReported,
      query.page || 1,
      query.limit || 20,
      query.sortBy,
      query.sortOrder as 'asc' | 'desc',
    );
  }

  @Get('comments/stats')
  @ApiOperation({ summary: 'Thống kê bình luận' })
  async getCommentStats() {
    return this.socialService.getCommentStats();
  }

  @Get('comments/:id')
  @ApiOperation({ summary: 'Chi tiết bình luận' })
  async getComment(@Param('id') id: string) {
    return this.socialService.getCommentById(id);
  }

  @Post('comments/:id/moderate')
  @ApiOperation({ summary: 'Duyệt/ẩn bình luận' })
  async moderateComment(
    @Param('id') id: string,
    @Body() dto: ModerateCommentDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.socialService.moderateComment(adminId, id, dto.isApproved);
  }

  @Post('comments/bulk-moderate')
  @ApiOperation({ summary: 'Duyệt/ẩn nhiều bình luận cùng lúc' })
  async bulkModerateComments(
    @Body() dto: BulkModerateDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.socialService.bulkModerateComments(adminId, dto.ids, dto.isApproved);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Xóa bình luận' })
  async deleteComment(@Param('id') id: string) {
    return this.socialService.deleteComment(id);
  }

  @Post('comments/bulk-delete')
  @ApiOperation({ summary: 'Xóa nhiều bình luận cùng lúc' })
  async bulkDeleteComments(@Body() body: { ids: string[] }) {
    return this.socialService.bulkDeleteComments(body.ids);
  }

  // ═══ Ratings ═══

  @Get('ratings')
  @ApiOperation({ summary: 'Danh sách đánh giá' })
  async getRatings(@Query() query: QueryRatingsDto) {
    return this.socialService.getRatings(
      query.videoId,
      query.userId,
      query.rating,
      query.page || 1,
      query.limit || 20,
      query.sortBy,
      query.sortOrder as 'asc' | 'desc',
    );
  }

  @Get('ratings/stats')
  @ApiOperation({ summary: 'Thống kê đánh giá' })
  async getRatingStats() {
    return this.socialService.getRatingStats();
  }

  @Get('ratings/distribution')
  @ApiOperation({ summary: 'Phân bố đánh giá' })
  async getRatingDistribution(@Query('videoId') videoId?: string) {
    return this.socialService.getRatingDistribution(videoId);
  }

  @Delete('ratings/:id')
  @ApiOperation({ summary: 'Xóa đánh giá spam' })
  async deleteRating(@Param('id') id: string) {
    return this.socialService.deleteRating(id);
  }

  // ═══ Favorites ═══

  @Get('favorites')
  @ApiOperation({ summary: 'Thống kê video được yêu thích nhất' })
  async getFavoriteStats(@Query() query: QueryFavoritesDto) {
    return this.socialService.getFavoriteStats(
      query.search,
      query.page || 1,
      query.limit || 20,
      query.sortBy,
      query.sortOrder as 'asc' | 'desc',
    );
  }

  @Get('favorites/video/:videoId')
  @ApiOperation({ summary: 'Danh sách người dùng yêu thích video' })
  async getVideoFavorites(
    @Param('videoId') videoId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.socialService.getVideoFavorites(videoId, page || 1, limit || 20);
  }

  // ═══ Likes ═══

  @Get('likes')
  @ApiOperation({ summary: 'Thống kê video được thích nhất' })
  async getLikeStats(@Query() query: QueryLikesDto) {
    return this.socialService.getLikeStats(
      query.search,
      query.page || 1,
      query.limit || 20,
      query.sortBy,
      query.sortOrder as 'asc' | 'desc',
    );
  }

  @Get('likes/video/:videoId')
  @ApiOperation({ summary: 'Danh sách người dùng thích video' })
  async getVideoLikes(
    @Param('videoId') videoId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.socialService.getVideoLikes(videoId, page || 1, limit || 20);
  }
}
