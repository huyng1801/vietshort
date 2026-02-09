import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, UserQueryDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Cập nhật profile' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê cá nhân' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Get('watch-history')
  @ApiOperation({ summary: 'Lịch sử xem' })
  async getWatchHistory(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.getWatchHistory(userId, page, limit);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Danh sách yêu thích' })
  async getFavorites(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.getFavorites(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin public user' })
  async findUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
