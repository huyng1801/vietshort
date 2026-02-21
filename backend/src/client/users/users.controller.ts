import { Controller, Get, Put, Post, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, UserQueryDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

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

  @Post('avatar-upload')
  @ApiOperation({ summary: 'Upload avatar tới R2 storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPG, PNG, GIF, WebP)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn một tệp hình ảnh');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Vui lòng tải lên một tệp hình ảnh hợp lệ');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Kích thước hình ảnh không được vượt quá 5MB');
    }

    return this.usersService.uploadAvatar(userId, file);
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
