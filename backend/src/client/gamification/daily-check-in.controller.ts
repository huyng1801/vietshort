import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DailyCheckInService } from './daily-check-in.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('gamification')
@Controller('gamification/check-in')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class DailyCheckInController {
  constructor(private readonly service: DailyCheckInService) {}

  @Post()
  @ApiOperation({ summary: 'Điểm danh hàng ngày' })
  async checkIn(@CurrentUser('id') userId: string) {
    return this.service.checkIn(userId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Trạng thái điểm danh' })
  async getStatus(@CurrentUser('id') userId: string) {
    return this.service.getStatus(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lịch sử điểm danh' })
  async getHistory(@CurrentUser('id') userId: string) {
    return this.service.getHistory(userId);
  }
}
