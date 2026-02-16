import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserManagementService } from './user-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { AdminActionDto } from './dto/user-management.dto';
import { VipType } from '@prisma/client';

@ApiTags('admin/users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminUsersController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách user' })
  async getUsers(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('vipTier') vipTier?: string,
    @Query('isLocked') isLocked?: string,
    @Query('isActive') isActive?: string,
    @Query('isEmailVerified') isEmailVerified?: string,
    @Query('registrationSource') registrationSource?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters = {
      vipTier,
      isLocked,
      isActive,
      isEmailVerified,
      registrationSource,
      dateFrom,
      dateTo,
    };
    return this.userManagementService.getUsers(search, page, limit, filters);
  }

  @Post(':id/lock')
  @ApiOperation({ summary: 'Khóa user' })
  async lockUser(@Param('id') id: string, @Body() dto: AdminActionDto) {
    return this.userManagementService.lockUser(id, dto.reason);
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Mở khóa user' })
  async unlockUser(@Param('id') id: string) {
    return this.userManagementService.unlockUser(id);
  }

  @Put(':id/gold')
  @ApiOperation({ summary: 'Điều chỉnh gold user' })
  async adjustUserGold(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.userManagementService.adjustUserGold(id, body.amount, body.reason, adminId);
  }

  @Put(':id/vip')
  @ApiOperation({ summary: 'Điều chỉnh VIP user' })
  async adjustUserVip(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Body() body: { vipType: VipType; vipDays: number },
  ) {
    return this.userManagementService.adjustUserVip(id, body.vipType, body.vipDays, adminId);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Lịch sử giao dịch user' })
  async getUserTransactions(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userManagementService.getTransactionsByUserId(id, page, limit);
  }

  @Get(':id/watch-history')
  @ApiOperation({ summary: 'Lịch sử xem phim của user' })
  async getUserWatchHistory(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('videoId') videoId?: string,
    @Query('isCompleted') isCompleted?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.userManagementService.getUserWatchHistory(id, page, limit, {
      videoId, isCompleted, dateFrom, dateTo,
    });
  }

  @Get(':id/unlocks')
  @ApiOperation({ summary: 'Lịch sử giải khóa tập phim' })
  async getUserUnlockHistory(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('method') method?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.userManagementService.getUserUnlockHistory(id, page, limit, {
      method, dateFrom, dateTo,
    });
  }

  @Get(':id/check-ins')
  @ApiOperation({ summary: 'Lịch sử điểm danh' })
  async getUserCheckInHistory(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.userManagementService.getUserCheckInHistory(id, page, limit, {
      dateFrom, dateTo,
    });
  }

  @Get(':id/engagement')
  @ApiOperation({ summary: 'Thống kê tương tác người dùng' })
  async getUserEngagement(@Param('id') id: string) {
    return this.userManagementService.getUserEngagementStats(id);
  }

  @Get(':id/referrals')
  @ApiOperation({ summary: 'Danh sách thành viên giới thiệu' })
  async getUserReferrals(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userManagementService.getUserReferrals(id, page, limit);
  }

  @Get(':id/audit-logs')
  @ApiOperation({ summary: 'Nhật ký thay đổi liên quan đến user' })
  async getUserAuditLogs(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('action') action?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.userManagementService.getUserAuditLogs(id, page, limit, {
      action, dateFrom, dateTo,
    });
  }

  @Get(':id/achievements')
  @ApiOperation({ summary: 'Thành tích người dùng' })
  async getUserAchievements(@Param('id') id: string) {
    return this.userManagementService.getUserAchievements(id);
  }

  @Get(':id/daily-tasks')
  @ApiOperation({ summary: 'Tiến độ nhiệm vụ hàng ngày' })
  async getUserDailyTasks(
    @Param('id') id: string,
    @Query('date') date?: string,
  ) {
    return this.userManagementService.getUserDailyTaskProgress(id, date);
  }

  @Post(':id/remove-vip')
  @ApiOperation({ summary: 'Xóa VIP của user' })
  async removeUserVip(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.userManagementService.removeUserVip(id, adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết user' })
  async getUser(@Param('id') id: string) {
    return this.userManagementService.getUserById(id);
  }
}
