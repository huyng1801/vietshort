import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('admin-analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tổng quan thống kê' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getOverview(@Query('days') days = 30) {
    return this.service.getOverview(+days);
  }

  @Get('views')
  @ApiOperation({ summary: 'Thống kê lượt xem' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getViews(@Query('days') days = 30) {
    return this.service.getViewsReport(+days);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Báo cáo doanh thu' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getRevenue(@Query('days') days = 30) {
    return this.service.getRevenueReport(+days);
  }

  @Get('users')
  @ApiOperation({ summary: 'Thống kê người dùng' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getUsers(@Query('days') days = 30) {
    return this.service.getUsersReport(+days);
  }

  @Get('top-videos')
  @ApiOperation({ summary: 'Top video' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopVideos(@Query('limit') limit = 10) {
    return this.service.getTopVideos(+limit);
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Tăng trưởng người dùng' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getUserGrowth(@Query('days') days = 30) {
    return this.service.getUserGrowth(+days);
  }
}
