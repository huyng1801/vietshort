import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('likes')
@Controller('likes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle/:videoId')
  @ApiOperation({ summary: 'Toggle yêu thích video' })
  async toggle(@CurrentUser('id') userId: string, @Param('videoId') videoId: string) {
    return this.likesService.toggleFavorite(userId, videoId);
  }

  @Get('check/:videoId')
  @ApiOperation({ summary: 'Kiểm tra đã yêu thích chưa' })
  async check(@CurrentUser('id') userId: string, @Param('videoId') videoId: string) {
    return this.likesService.isLiked(userId, videoId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách yêu thích' })
  async list(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.likesService.getUserLikes(userId, page, limit);
  }
}
