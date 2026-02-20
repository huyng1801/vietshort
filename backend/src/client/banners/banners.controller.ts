import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { GetBannersDto } from './dto/banner.dto';
import { Public, CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('Client - Banners')
@Controller('client/banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Lấy danh sách banners cho trang chủ',
    description: 'Trả về các banners đang active, lọc theo VIP type và thời gian hiển thị. Endpoint public nhưng sẽ tùy chỉnh theo VIP type nếu user đã đăng nhập.'
  })
  async getBanners(@Query() query: GetBannersDto, @CurrentUser() user?: any) {
    // Lấy VIP type từ user nếu đã đăng nhập, ngược lại dùng query hoặc null (free)
    const vipType = user?.vipType || query.vipType;
    const limit = query.limit || 10;

    const banners = await this.bannersService.getActiveBanners(vipType, limit);
    
    return {
      success: true,
      data: banners,
    };
  }
}
