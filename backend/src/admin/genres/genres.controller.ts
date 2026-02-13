import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GenresManagementService } from './genres.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateGenreDto, UpdateGenreDto, QueryGenreDto } from './dto/genre.dto';

@ApiTags('admin/genres')
@Controller('admin/genres')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminGenresController {
  constructor(private readonly genresService: GenresManagementService) {}

  @Get('max-sort-order')
  @ApiOperation({ summary: 'Lấy sortOrder lớn nhất của thể loại' })
  async getMaxSortOrder() {
    return this.genresService.getMaxSortOrder();
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách thể loại' })
  async getGenres(@Query() query: QueryGenreDto) {
    return this.genresService.getGenres(query.search, query.isActive, query.page || 1, query.limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết thể loại' })
  async getGenre(@Param('id') id: string) {
    return this.genresService.getGenreById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo thể loại mới' })
  async createGenre(@Body() dto: CreateGenreDto) {
    return this.genresService.createGenre(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thể loại' })
  async updateGenre(@Param('id') id: string, @Body() dto: UpdateGenreDto) {
    return this.genresService.updateGenre(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thể loại' })
  async deleteGenre(@Param('id') id: string) {
    return this.genresService.deleteGenre(id);
  }
}
