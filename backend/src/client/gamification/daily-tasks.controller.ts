import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DailyTasksService } from './daily-tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('gamification')
@Controller('gamification/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class DailyTasksController {
  constructor(private readonly service: DailyTasksService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách nhiệm vụ hàng ngày' })
  async getDailyTasks(@CurrentUser('id') userId: string) {
    return this.service.getDailyTasks(userId);
  }

  @Post('watch')
  @ApiOperation({ summary: 'Ghi nhận tiến trình xem' })
  async trackWatch(@CurrentUser('id') userId: string) {
    return this.service.trackWatchProgress(userId);
  }
}
