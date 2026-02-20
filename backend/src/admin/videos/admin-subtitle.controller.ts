import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNotEmpty, IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubtitleService, CreateSubtitleDto, GenerateSubtitleDto } from './services/subtitle.service';

// ─── DTOs ────────────────────────────────────────────────

export class UploadSubtitleBodyDto {
  @ApiProperty({ enum: ['vi', 'en'], description: 'Chỉ hỗ trợ tiếng Việt (vi) hoặc tiếng Anh (en)' })
  @IsString() @IsNotEmpty() @IsIn(['vi', 'en'])
  language: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  content: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  label?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isAuto?: boolean;
}

export class GenerateSubtitleBodyDto {
  @ApiProperty({ enum: ['vi', 'en'], description: 'Chỉ hỗ trợ tiếng Việt (vi) hoặc tiếng Anh (en)' })
  @IsString() @IsNotEmpty() @IsIn(['vi', 'en'])
  targetLanguage: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  sourceLanguage?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  label?: string;
}

export class UpdateSubtitleContentDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  content: string;
}

class BulkMappingItem {
  @ApiProperty() @IsString() @IsNotEmpty()
  episodeId: string;

  @ApiProperty({ enum: ['vi', 'en'], description: 'Chỉ hỗ trợ tiếng Việt (vi) hoặc tiếng Anh (en)' })
  @IsString() @IsNotEmpty() @IsIn(['vi', 'en'])
  language: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  content: string;
}

export class BulkUploadDto {
  @ApiProperty({ type: [BulkMappingItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkMappingItem)
  mappings: BulkMappingItem[];
}

// ─── Controller ──────────────────────────────────────────

@ApiTags('admin/subtitles')
@Controller('admin/subtitles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminSubtitleController {
  constructor(private readonly subtitleService: SubtitleService) {}

  // ═══ LIST / OVERVIEW ═══

  @Get()
  @ApiOperation({ summary: 'Danh sách video kèm trạng thái phụ đề' })
  async getVideosWithSubtitles(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('genre') genre?: string,
    @Query('isSerial') isSerial?: string,
    @Query('subtitleStatus') subtitleStatus?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.subtitleService.getVideosWithSubtitles({
      search,
      status,
      genre,
      isSerial: isSerial === 'true' ? true : isSerial === 'false' ? false : undefined,
      subtitleStatus,
      page,
      limit,
    });
  }

  @Get('queue-status')
  @ApiOperation({ summary: 'Trạng thái hàng đợi AI phụ đề' })
  async getQueueStatus() {
    return this.subtitleService.getQueueStatus();
  }

  // ═══ VIDEO / EPISODE SUBTITLES ═══

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Phụ đề của video (tất cả tập)' })
  async getVideoSubtitles(@Param('videoId') videoId: string) {
    return this.subtitleService.getVideoSubtitles(videoId);
  }

  @Get('episode/:episodeId')
  @ApiOperation({ summary: 'Phụ đề của một tập' })
  async getEpisodeSubtitles(@Param('episodeId') episodeId: string) {
    return this.subtitleService.getEpisodeSubtitles(episodeId);
  }

  // ═══ SINGLE SUBTITLE (DETAIL) ═══

  @Get('detail/:id')
  @ApiOperation({ summary: 'Chi tiết phụ đề (kèm nội dung)' })
  async getSubtitle(@Param('id') id: string) {
    return this.subtitleService.getSubtitle(id);
  }

  // ═══ UPLOAD / CREATE ═══

  @Post('episode/:episodeId/upload')
  @ApiOperation({ summary: 'Upload SRT cho tập phim' })
  async uploadSubtitle(
    @Param('episodeId') episodeId: string,
    @Body() dto: UploadSubtitleBodyDto,
  ) {
    return this.subtitleService.uploadSubtitle(episodeId, dto);
  }

  @Post('video/:videoId/bulk-upload')
  @ApiOperation({ summary: 'Bulk upload phụ đề cho nhiều tập' })
  async bulkUpload(
    @Param('videoId') videoId: string,
    @Body() dto: BulkUploadDto,
  ) {
    return this.subtitleService.bulkUploadSubtitles(videoId, dto.mappings);
  }

  // ═══ AI GENERATION ═══

  @Post('episode/:episodeId/generate')
  @ApiOperation({ summary: 'Tạo phụ đề AI (Whisper) cho tập phim' })
  async generateSubtitle(
    @Param('episodeId') episodeId: string,
    @Body() dto: GenerateSubtitleBodyDto,
  ) {
    return this.subtitleService.generateSubtitle(episodeId, dto);
  }

  // ═══ UPDATE / DELETE ═══

  @Patch('detail/:id')
  @ApiOperation({ summary: 'Cập nhật nội dung phụ đề' })
  async updateSubtitleContent(
    @Param('id') id: string,
    @Body() dto: UpdateSubtitleContentDto,
  ) {
    return this.subtitleService.updateSubtitleContent(id, dto.content);
  }

  @Delete('detail/:id')
  @ApiOperation({ summary: 'Xóa phụ đề' })
  async deleteSubtitle(@Param('id') id: string) {
    return this.subtitleService.deleteSubtitle(id);
  }
}
