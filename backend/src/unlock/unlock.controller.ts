import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnlockService } from './unlock.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('unlock')
@Controller('unlock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UnlockController {
  constructor(private readonly unlockService: UnlockService) {}

  @Get('check/:episodeId')
  @ApiOperation({ summary: 'Kiểm tra quyền truy cập tập phim' })
  async checkAccess(@CurrentUser('id') userId: string, @Param('episodeId') episodeId: string) {
    return this.unlockService.checkAccess(userId, episodeId);
  }

  @Post('gold/:episodeId')
  @ApiOperation({ summary: 'Mở khóa bằng gold' })
  async unlockWithGold(@CurrentUser('id') userId: string, @Param('episodeId') episodeId: string) {
    return this.unlockService.unlockWithGold(userId, episodeId);
  }
}
