import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';
import { Public } from '../../common/decorators/user.decorator';
import { RegisterAffiliateDto, AffiliateLoginDto, RequestPayoutDto } from './dto/affiliate.dto';

@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly service: AffiliateService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký CTV' })
  async register(@Body() dto: RegisterAffiliateDto) {
    return this.service.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'CTV đăng nhập' })
  async login(@Body() dto: AffiliateLoginDto) {
    return this.service.login(dto.email, dto.password);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Thông tin CTV' })
  async getProfile(@Query('affiliateId') affiliateId: string) {
    return this.service.getProfile(affiliateId);
  }

  @Get('referrals')
  @ApiOperation({ summary: 'Danh sách referral' })
  async getReferrals(@Query('affiliateId') affiliateId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.getReferrals(affiliateId, +page, +limit);
  }

  @Post('payout')
  @ApiOperation({ summary: 'Yêu cầu rút tiền' })
  async requestPayout(@Query('affiliateId') affiliateId: string, @Body() dto: RequestPayoutDto) {
    return this.service.requestPayout(affiliateId, dto);
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Lịch sử rút tiền' })
  async getPayouts(@Query('affiliateId') affiliateId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.getPayouts(affiliateId, +page, +limit);
  }
}
