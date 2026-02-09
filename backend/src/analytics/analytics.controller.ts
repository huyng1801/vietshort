import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN)
@ApiBearerAuth('JWT')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tổng quan thống kê' })
  async getOverview(@Query('days') days = 30) {
    return this.service.getOverview(+days);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Báo cáo doanh thu' })
  async getRevenue(@Query('days') days = 30) {
    return this.service.getRevenueReport(+days);
  }

  @Get('top-videos')
  @ApiOperation({ summary: 'Top video' })
  async getTopVideos(@Query('limit') limit = 10) {
    return this.service.getTopVideos(+limit);
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Tăng trưởng người dùng' })
  async getUserGrowth(@Query('days') days = 30) {
    return this.service.getUserGrowth(+days);
  }
}
