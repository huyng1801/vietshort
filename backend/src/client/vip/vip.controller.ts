import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VipService } from './vip.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { Public, CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('vip')
@Controller('vip')
export class VipController {
  constructor(private readonly vipService: VipService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'Danh sách gói VIP' })
  async getPlans() {
    return this.vipService.getVipPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Trạng thái VIP' })
  async getStatus(@CurrentUser('id') userId: string) {
    return this.vipService.getVipStatus(userId);
  }
}
