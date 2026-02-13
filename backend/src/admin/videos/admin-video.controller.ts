import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsInt,
  Min, Max, MaxLength, MinLength, IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { AdminVideoService } from './services/admin-video.service';
import { AgeRating, VideoStatus, VipType, EncodingStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── DTOs ────────────────────────────────────────────────

export class CreateVideoBodyDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  poster?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1900) @Max(2100) @Type(() => Number)
  releaseYear?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  director?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  actors?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  country?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  genres?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isSerial?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(9999) @Type(() => Number)
  totalEpisodes?: number;

  @ApiPropertyOptional({ enum: AgeRating }) @IsOptional() @IsEnum(AgeRating)
  ageRating?: AgeRating;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isVipOnly?: boolean;

  @ApiPropertyOptional({ enum: VipType }) @IsOptional() @IsEnum(VipType)
  vipTier?: VipType;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  unlockPrice?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  keywords?: string;
}

export class UpdateVideoBodyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  poster?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1900) @Max(2100) @Type(() => Number)
  releaseYear?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  director?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  actors?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  country?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  genres?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isSerial?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(9999) @Type(() => Number)
  totalEpisodes?: number;

  @ApiPropertyOptional({ enum: AgeRating }) @IsOptional() @IsEnum(AgeRating)
  ageRating?: AgeRating;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isVipOnly?: boolean;

  @ApiPropertyOptional({ enum: VipType }) @IsOptional() @IsEnum(VipType)
  vipTier?: VipType;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  unlockPrice?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  keywords?: string;
}

export class CreateEpisodeBodyDto {
  @ApiProperty() @IsInt() @Min(1) @Max(9999) @Type(() => Number)
  episodeNumber: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  title?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  unlockPrice?: number;
}

export class UploadUrlDto {
  @ApiProperty({ description: 'Content type, e.g. video/mp4' })
  @IsString() @IsNotEmpty()
  contentType: string;
}

export class UpdatePosterDto {
  @ApiProperty({ description: 'URL của poster mới' })
  @IsString() @IsNotEmpty()
  poster: string;
}

export class SubtitleDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  language: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  content: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isAuto?: boolean;
}

// ─── Controller ──────────────────────────────────────────

@ApiTags('admin/videos')
@Controller('admin/videos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminVideoController {
  constructor(private readonly adminVideoService: AdminVideoService) {}

  // ═══ VIDEO CRUD ═══

  @Post()
  @ApiOperation({ summary: '1️⃣ Tạo phim mới (metadata only, không upload video)' })
  async createVideo(@Body() dto: CreateVideoBodyDto) {
    return this.adminVideoService.createVideo(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách video (admin)' })
  async getVideos(
    @Query('search') search?: string,
    @Query('status') status?: VideoStatus,
    @Query('genre') genre?: string,
    @Query('country') country?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.adminVideoService.getVideos({ search, status, genre, country, sort, order, page, limit });
  }

  @Get('unique-genres')
  @ApiOperation({ summary: 'Lấy danh sách thể loại unique từ videos' })
  async getUniqueGenres() {
    return this.adminVideoService.getUniqueGenres();
  }

  @Get('encoding-queue')
  @ApiOperation({ summary: 'Hàng đợi mã hóa' })
  async getEncodingQueue(
    @Query('status') status?: EncodingStatus,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.adminVideoService.getEncodingQueue(status, page, limit);
  }

  @Get('encoding-stats')
  @ApiOperation({ summary: 'Thống kê encoding queue' })
  async getEncodingStats() {
    return this.adminVideoService.getEncodingStats();
  }

  @Get('system-check')
  @ApiOperation({ summary: '🔧 Kiểm tra hệ thống (R2, DB, FFmpeg)' })
  async checkSystemRequirements() {
    return this.adminVideoService.checkSystemRequirements();
  }

  @Get('test-r2')
  @ApiOperation({ summary: '🧪 Test kết nối R2 storage' })
  async testR2Connection() {
    return this.adminVideoService.testR2Connection();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết video' })
  async getVideo(@Param('id') id: string) {
    return this.adminVideoService.getVideo(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật video metadata' })
  async updateVideo(@Param('id') id: string, @Body() dto: UpdateVideoBodyDto) {
    return this.adminVideoService.updateVideo(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa video' })
  async deleteVideo(@Param('id') id: string) {
    return this.adminVideoService.deleteVideo(id);
  }

  // ═══ PUBLISH / UNPUBLISH ═══

  @Post(':id/publish')
  @ApiOperation({ summary: '8️⃣ Xuất bản video (cần ≥1 ep COMPLETED)' })
  async publishVideo(@Param('id') id: string) {
    return this.adminVideoService.publishVideo(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Gỡ xuất bản video' })
  async unpublishVideo(@Param('id') id: string) {
    return this.adminVideoService.unpublishVideo(id);
  }

  // ═══ POSTER UPLOAD ═══

  @Post(':id/poster-upload-url')
  @ApiOperation({ summary: 'Lấy presigned URL upload poster' })
  async getPosterUploadUrl(@Param('id') id: string, @Body() dto: UploadUrlDto) {
    return this.adminVideoService.getPosterUploadUrl(id, dto.contentType);
  }

  @Patch(':id/poster')
  @ApiOperation({ summary: 'Cập nhật poster video' })
  async updatePoster(@Param('id') id: string, @Body() dto: UpdatePosterDto) {
    return this.adminVideoService.updatePoster(id, dto.poster);
  }

  // ═══ EPISODE CRUD ═══

  @Post(':videoId/episodes')
  @ApiOperation({ summary: '2️⃣ Tạo tập phim (trước khi upload file)' })
  async createEpisode(@Param('videoId') videoId: string, @Body() dto: CreateEpisodeBodyDto) {
    return this.adminVideoService.createEpisode(videoId, dto);
  }

  @Get(':videoId/episodes')
  @ApiOperation({ summary: 'Danh sách tập phim' })
  async getEpisodes(@Param('videoId') videoId: string) {
    return this.adminVideoService.getEpisodes(videoId);
  }

  // ═══ EPISODE UPLOAD & ENCODE ═══

  @Post('episodes/:episodeId/upload-url')
  @ApiOperation({ summary: '3️⃣ Lấy presigned URL upload file gốc' })
  async getEpisodeUploadUrl(@Param('episodeId') episodeId: string, @Body() dto: UploadUrlDto) {
    try {
      const result = await this.adminVideoService.getEpisodeUploadUrl(episodeId, dto.contentType);
      // Log success without sensitive data
      console.log(`✅ Upload URL generated for episode ${episodeId}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to generate upload URL for episode ${episodeId}:`, (error as any)?.message || error);
      throw error;
    }
  }

  @Post('episodes/:episodeId/verify-upload')
  @ApiOperation({ summary: '3.5️⃣ Xác minh upload thành công' })
  async verifyEpisodeUpload(@Param('episodeId') episodeId: string) {
    try {
      const result = await this.adminVideoService.verifyEpisodeUpload(episodeId);
      console.log(`✅ Upload verified for episode ${episodeId}`);
      return result;
    } catch (error) {
      console.error(`❌ Upload verification failed for episode ${episodeId}:`, (error as any)?.message || error);
      throw error;
    }
  }

  @Post('episodes/:episodeId/process')
  @ApiOperation({ summary: '4️⃣ Trigger encode worker (sau khi upload xong)' })
  async processEpisode(@Param('episodeId') episodeId: string) {
    try {
      const result = await this.adminVideoService.processEpisode(episodeId);
      console.log(`✅ Episode processing started for ${episodeId}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to start processing for episode ${episodeId}:`, (error as any)?.message || error);
      throw error;
    }
  }

  @Post('episodes/:episodeId/reprocess')
  @ApiOperation({ summary: '5️⃣ Retry encode (cho tập FAILED)' })
  async reprocessEpisode(@Param('episodeId') episodeId: string) {
    return this.adminVideoService.reprocessEpisode(episodeId);
  }

  @Get('episodes/:episodeId')
  @ApiOperation({ summary: 'Chi tiết tập phim' })
  async getEpisode(@Param('episodeId') episodeId: string) {
    return this.adminVideoService.getEpisode(episodeId);
  }

  @Patch('episodes/:episodeId')
  @ApiOperation({ summary: 'Cập nhật tập phim' })
  async updateEpisode(@Param('episodeId') episodeId: string, @Body() dto: CreateEpisodeBodyDto) {
    return this.adminVideoService.updateEpisode(episodeId, dto);
  }

  @Delete('episodes/:episodeId')
  @ApiOperation({ summary: 'Xóa tập phim' })
  async deleteEpisode(@Param('episodeId') episodeId: string) {
    return this.adminVideoService.deleteEpisode(episodeId);
  }

  // ═══ SUBTITLE ═══

  @Post('episodes/:episodeId/subtitles')
  @ApiOperation({ summary: '7️⃣ Upload phụ đề cho tập phim' })
  async addSubtitle(@Param('episodeId') episodeId: string, @Body() dto: SubtitleDto) {
    return this.adminVideoService.addSubtitle(episodeId, dto.language, dto.content, dto.isAuto);
  }

  @Delete('subtitles/:subtitleId')
  @ApiOperation({ summary: 'Xóa phụ đề' })
  async deleteSubtitle(@Param('subtitleId') subtitleId: string) {
    return this.adminVideoService.deleteSubtitle(subtitleId);
  }
}
