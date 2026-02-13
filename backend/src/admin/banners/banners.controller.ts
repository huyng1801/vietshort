import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannerManagementService } from './banner-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateBannerDto, UpdateBannerDto, QueryBannerDto } from './dto/banner.dto';

@ApiTags('admin/banners')
@Controller('admin/banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminBannersController {
  constructor(private readonly bannerService: BannerManagementService) {}

  @Get('max-sort-order')
  @ApiOperation({ summary: 'Lấy sortOrder lớn nhất của banner' })
  async getBannerMaxSortOrder() {
    return this.bannerService.getMaxSortOrder();
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách banner' })
  async getBanners(@Query() query: QueryBannerDto) {
    return this.bannerService.getBanners(query.search, query.isActive, query.page || 1, query.limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết banner' })
  async getBanner(@Param('id') id: string) {
    return this.bannerService.getBannerById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo banner mới' })
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.bannerService.createBanner(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật banner' })
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannerService.updateBanner(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa banner' })
  async deleteBanner(@Param('id') id: string) {
    return this.bannerService.deleteBanner(id);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Bật/tắt banner' })
  async toggleBanner(@Param('id') id: string) {
    return this.bannerService.toggleBannerStatus(id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Sắp xếp lại thứ tự banner' })
  async reorderBanners(@Body() body: { bannerIds: string[] }) {
    return this.bannerService.reorderBanners(body.bannerIds);
  }

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload hình ảnh banner lên R2' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: any) {
    return this.bannerService.uploadImage(file);
  }
}
