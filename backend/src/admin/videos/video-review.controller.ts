import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideoManagementService } from './video-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminActionDto } from '../users/dto/user-management.dto';

@ApiTags('admin/videos')
@Controller('admin/videos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminVideoReviewController {
  constructor(private readonly videoManagementService: VideoManagementService) {}

  @Get('review')
  @ApiOperation({ summary: 'Video chờ duyệt' })
  async getVideosForReview(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.videoManagementService.getVideosForReview(page, limit);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Duyệt video' })
  async approveVideo(@Param('id') id: string) {
    return this.videoManagementService.approveVideo(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Từ chối video' })
  async rejectVideo(@Param('id') id: string, @Body() dto: AdminActionDto) {
    return this.videoManagementService.rejectVideo(id, dto.reason);
  }
}
