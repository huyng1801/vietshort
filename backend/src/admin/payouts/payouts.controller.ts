import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AffiliateManagementService } from './affiliate-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateAffiliateDto, UpdateAffiliateDto, PayoutActionDto } from './dto/affiliate.dto';

@ApiTags('admin/payouts')
@Controller('admin/payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminPayoutsController {
  constructor(private readonly affiliateManagementService: AffiliateManagementService) {}

  // ===== Affiliates =====

  @Get('affiliates')
  @ApiOperation({ summary: 'Danh sách affiliate (lọc theo cấp, loại, CTV cha)' })
  async getAffiliates(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('isVerified') isVerified?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('tier') tier?: string,
    @Query('parentId') parentId?: string,
    @Query('affiliateType') affiliateType?: string,
  ) {
    return this.affiliateManagementService.getAffiliates(
      page, limit, search, isActive, isVerified, dateFrom, dateTo, tier, parentId, affiliateType,
    );
  }

  @Get('affiliates/:id')
  @ApiOperation({ summary: 'Chi tiết affiliate (kèm danh sách CTV cấp dưới)' })
  async getAffiliateById(@Param('id') id: string) {
    return this.affiliateManagementService.getAffiliateById(id);
  }

  @Get('affiliates/:id/tree')
  @ApiOperation({ summary: 'Cây mạng lưới affiliate (3 cấp)' })
  async getAffiliateTree(@Param('id') id: string) {
    return this.affiliateManagementService.getAffiliateTree(id);
  }

  @Get('affiliates/:id/sub-affiliates')
  @ApiOperation({ summary: 'Danh sách CTV cấp dưới trực tiếp' })
  async getSubAffiliates(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.affiliateManagementService.getSubAffiliates(id, page, limit);
  }

  @Get('affiliates/:id/network-stats')
  @ApiOperation({ summary: 'Thống kê mạng lưới affiliate' })
  async getNetworkStats(@Param('id') id: string) {
    return this.affiliateManagementService.getNetworkStats(id);
  }

  @Post('affiliates')
  @ApiOperation({ summary: 'Tạo affiliate mới (tự xác định cấp từ CTV cha)' })
  async createAffiliate(@Body() dto: CreateAffiliateDto) {
    return this.affiliateManagementService.createAffiliate(dto);
  }

  @Patch('affiliates/:id')
  @ApiOperation({ summary: 'Cập nhật affiliate' })
  async updateAffiliate(@Param('id') id: string, @Body() dto: UpdateAffiliateDto) {
    return this.affiliateManagementService.updateAffiliate(id, dto);
  }

  @Post('affiliates/:id/toggle-status')
  @ApiOperation({ summary: 'Kích hoạt/vô hiệu hóa affiliate (bao gồm cấp dưới)' })
  async toggleAffiliateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.affiliateManagementService.toggleAffiliateStatus(id, isActive);
  }

  // ===== Referrals =====

  @Get('affiliates/:id/referrals')
  @ApiOperation({ summary: 'Danh sách referral của affiliate' })
  async getAffiliateReferrals(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.affiliateManagementService.getAffiliateReferrals(id, page, limit);
  }

  // ===== Payouts =====

  @Get('affiliates/:id/payouts')
  @ApiOperation({ summary: 'Danh sách payout của affiliate' })
  async getAffiliatePayouts(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: string,
  ) {
    return this.affiliateManagementService.getAffiliatePayouts(id, page, limit, status);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Yêu cầu rút tiền chờ duyệt' })
  async getPendingPayouts(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.affiliateManagementService.getPendingPayouts(page, limit);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Duyệt rút tiền' })
  async approvePayout(@Param('id') id: string) {
    return this.affiliateManagementService.approvePayout(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Từ chối rút tiền' })
  async rejectPayout(@Param('id') id: string, @Body() dto: PayoutActionDto) {
    return this.affiliateManagementService.rejectPayout(id, dto.reason);
  }
}
