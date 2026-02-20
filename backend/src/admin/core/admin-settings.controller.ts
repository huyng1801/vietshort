import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSettingsService } from './admin-settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('admin/settings')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  // ═══════════════════════════════════════════════════════════
  // VIP PLANS
  // ═══════════════════════════════════════════════════════════

  @Get('vip-plans')
  @ApiOperation({ summary: 'Danh sách gói VIP' })
  async getVipPlans() {
    return this.settingsService.getVipPlans();
  }

  @Patch('vip-plans/:id')
  @ApiOperation({ summary: 'Cập nhật giá gói VIP' })
  async updateVipPlanPrice(
    @Param('id') id: string,
    @Body() body: { priceVnd: number },
  ) {
    return this.settingsService.updateVipPlanPrice(id, body.priceVnd);
  }

  // ═══════════════════════════════════════════════════════════
  // GOLD PACKAGES
  // ═══════════════════════════════════════════════════════════

  @Get('gold-packages')
  @ApiOperation({ summary: 'Danh sách gói nạp Gold' })
  async getGoldPackages() {
    return this.settingsService.getGoldPackages();
  }

  @Post('gold-packages')
  @ApiOperation({ summary: 'Tạo gói nạp Gold' })
  async createGoldPackage(@Body() body: {
    name: string;
    goldAmount: number;
    bonusGold?: number;
    priceVnd: number;
    isPopular?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    description?: string;
  }) {
    return this.settingsService.createGoldPackage(body);
  }

  @Patch('gold-packages/:id')
  @ApiOperation({ summary: 'Cập nhật gói nạp Gold' })
  async updateGoldPackage(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      goldAmount?: number;
      bonusGold?: number;
      priceVnd?: number;
      isPopular?: boolean;
      isActive?: boolean;
      sortOrder?: number;
      description?: string;
    },
  ) {
    return this.settingsService.updateGoldPackage(id, body);
  }

  @Delete('gold-packages/:id')
  @ApiOperation({ summary: 'Xóa gói nạp Gold' })
  async deleteGoldPackage(@Param('id') id: string) {
    return this.settingsService.deleteGoldPackage(id);
  }
}
