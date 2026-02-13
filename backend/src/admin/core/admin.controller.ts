import { Controller, Get, Post, Patch, Body, UseGuards, HttpCode, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/user.decorator';
import { AdminLoginDto, CreateAdminDto } from './dto/admin.dto';
import { AdminRole } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin đăng nhập' })
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto.email, dto.password);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Tạo admin mới' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto, AdminRole.SUPER_ADMIN);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Lấy thông tin profile admin' })
  async getProfile(@Req() req: any) {
    return this.adminService.getProfile(req.user.sub || req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cập nhật profile admin' })
  async updateProfile(@Req() req: any, @Body() data: any) {
    return this.adminService.updateProfile(req.user.sub || req.user.id, data);
  }

  @Post('profile/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Đổi mật khẩu admin' })
  async changePassword(@Req() req: any, @Body() data: { currentPassword: string; newPassword: string }) {
    return this.adminService.changePassword(req.user.sub || req.user.id, data.currentPassword, data.newPassword);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Thống kê dashboard' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/activity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Hoạt động gần đây' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentActivity(@Query('limit') limit = 10) {
    return this.adminService.getRecentActivity(+limit);
  }
}
