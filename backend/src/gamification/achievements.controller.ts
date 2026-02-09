import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('gamification')
@Controller('gamification/achievements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thành tích' })
  async getAchievements(@CurrentUser('id') userId: string) {
    return this.service.getAchievements(userId);
  }
}
