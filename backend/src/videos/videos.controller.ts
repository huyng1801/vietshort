import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { VideosService } from './videos.service';
import { CreateVideoDto, UpdateVideoDto, QueryVideoDto, CreateEpisodeDto, UpdateWatchProgressDto } from './dto/video.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Public, CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminRole } from '@prisma/client';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách video (public)' })
  async findAll(@Query() query: QueryVideoDto) {
    return this.videosService.findAll(query);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Video trending' })
  async getTrending(@Query('limit') limit?: number) {
    return this.videosService.getTrending(limit);
  }

  @Public()
  @Get('new-releases')
  @ApiOperation({ summary: 'Video mới phát hành' })
  async getNewReleases(@Query('limit') limit?: number) {
    return this.videosService.getNewReleases(limit);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Chi tiết video theo slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.videosService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết video theo ID' })
  async findById(@Param('id') id: string) {
    return this.videosService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Tạo video mới (admin)' })
  async create(@Body() dto: CreateVideoDto) {
    return this.videosService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @Put(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cập nhật video (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateVideoDto) {
    return this.videosService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @Post('episodes')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Thêm tập phim (admin)' })
  async createEpisode(@Body() dto: CreateEpisodeDto) {
    return this.videosService.createEpisode(dto);
  }

  @Public()
  @Get('episodes/:id')
  @ApiOperation({ summary: 'Chi tiết tập phim' })
  async getEpisode(@Param('id') id: string) {
    return this.videosService.getEpisode(id);
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({ summary: 'Tăng lượt xem' })
  async incrementView(@Param('id') id: string) {
    await this.videosService.incrementViewCount(id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':videoId/watch-progress')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cập nhật tiến trình xem' })
  async updateWatchProgress(
    @CurrentUser('id') userId: string,
    @Param('videoId') videoId: string,
    @Body() body: UpdateWatchProgressDto,
  ) {
    return this.videosService.updateWatchProgress(userId, videoId, body.episodeId ?? null, body.progressive);
  }

  // ─── Access Control & Streaming ──────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('episodes/:episodeId/access')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Kiểm tra quyền truy cập tập phim' })
  async checkAccess(
    @CurrentUser() user: any,
    @Param('episodeId') episodeId: string,
  ) {
    return this.videosService.checkEpisodeAccess(
      user?.id || null,
      episodeId,
      user?.vipTier,
      user?.vipExpiresAt,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('episodes/:episodeId/stream')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Lấy signed streaming URL cho tập phim' })
  async getStreamingUrl(
    @CurrentUser() user: any,
    @Param('episodeId') episodeId: string,
  ) {
    return this.videosService.getStreamingUrl(
      episodeId,
      user?.id || null,
      user?.vipTier,
      user?.vipExpiresAt,
    );
  }
}
