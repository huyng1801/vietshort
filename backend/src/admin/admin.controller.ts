import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './services/admin.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public, CurrentUser } from '../common/decorators/user.decorator';
import { AdminLoginDto, CreateAdminDto, AdminActionDto } from './dto/admin.dto';
import { AdminRole, VipType } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Admin đăng nhập' })
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto.email, dto.password);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Tạo admin mới' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto, AdminRole.SUPER_ADMIN);
  }

  // ===== Dashboard =====
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.MODERATOR) // Chuyển từ CONTENT_MANAGER thành MODERATOR để dễ access
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Thống kê dashboard' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ===== User Management =====
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.MODERATOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Danh sách user' })
  async getUsers(@Query('search') search?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getUsers(search, +page, +limit);
  }

  @Post('users/:id/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.MODERATOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Khóa user' })
  async lockUser(@Param('id') id: string, @Body() dto: AdminActionDto) {
    return this.adminService.lockUser(id, dto.reason);
  }

  @Post('users/:id/unlock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.MODERATOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Mở khóa user' })
  async unlockUser(@Param('id') id: string) {
    return this.adminService.unlockUser(id);
  }

  @Put('users/:id/gold')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Điều chỉnh gold user' })
  async adjustUserGold(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.adminService.adjustUserGold(id, body.amount, body.reason, adminId);
  }

  @Put('users/:id/vip')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Điều chỉnh VIP user' })
  async adjustUserVip(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Body() body: { vipType: VipType; vipDays: number },
  ) {
    return this.adminService.adjustUserVip(id, body.vipType, body.vipDays, adminId);
  }

  // ===== Video Management =====
  @Get('videos/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Video chờ duyệt' })
  async getVideosForReview(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getVideosForReview(+page, +limit);
  }

  @Post('videos/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Duyệt video' })
  async approveVideo(@Param('id') id: string) {
    return this.adminService.approveVideo(id);
  }

  @Post('videos/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Từ chối video' })
  async rejectVideo(@Param('id') id: string, @Body() dto: AdminActionDto) {
    return this.adminService.rejectVideo(id, dto.reason);
  }

  // ===== Affiliate Management =====
  @Get('payouts/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Yêu cầu rút tiền chờ duyệt' })
  async getPendingPayouts(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getPendingPayouts(+page, +limit);
  }

  @Post('payouts/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Duyệt rút tiền' })
  async approvePayout(@Param('id') id: string) {
    return this.adminService.approvePayout(id);
  }

  @Post('payouts/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Từ chối rút tiền' })
  async rejectPayout(@Param('id') id: string, @Body() dto: AdminActionDto) {
    return this.adminService.rejectPayout(id, dto.reason);
  }
}

  // ===== Genre Management =====
  @Get('genres')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Danh sách thể loại' })
  async getGenres(@Query() query: QueryGenreDto) {
    return this.categoryService.getGenres(query.search, query.isActive, query.page || 1, query.limit || 20);
  }

  @Get('genres/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Chi tiết thể loại' })
  async getGenre(@Param('id') id: string) {
    return this.categoryService.getGenreById(id);
  }

  @Post('genres')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Tạo thể loại mới' })
  async createGenre(@Body() dto: CreateGenreDto) {
    return this.categoryService.createGenre(dto);
  }

  @Patch('genres/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cập nhật thể loại' })
  async updateGenre(@Param('id') id: string, @Body() dto: UpdateGenreDto) {
    return this.categoryService.updateGenre(id, dto);
  }

  @Delete('genres/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Xóa thể loại' })
  async deleteGenre(@Param('id') id: string) {
    return this.categoryService.deleteGenre(id);
  }

  // ===== Audit Logs =====
  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Nhật ký hoạt động' })
  async getAuditLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.adminService.getAuditLogs(+page, +limit);
  }
}
