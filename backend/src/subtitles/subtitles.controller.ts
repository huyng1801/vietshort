import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubtitlesService } from './subtitles.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/user.decorator';
import { CreateSubtitleDto, UpdateSubtitleDto } from './dto/subtitle.dto';
import { AdminRole } from '@prisma/client';

@ApiTags('subtitles')
@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly service: SubtitlesService) {}

  @Public()
  @Get('episode/:episodeId')
  @ApiOperation({ summary: 'Lấy phụ đề theo tập phim' })
  async findByEpisode(@Param('episodeId') episodeId: string) {
    return this.service.findByEpisode(episodeId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Tạo phụ đề (Admin)' })
  async create(@Body() dto: CreateSubtitleDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cập nhật phụ đề (Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateSubtitleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Xóa phụ đề (Admin)' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
