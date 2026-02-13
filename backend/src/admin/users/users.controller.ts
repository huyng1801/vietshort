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

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết user' })
  async getUser(@Param('id') id: string) {
    return this.userManagementService.getUserById(id);
  }
}
