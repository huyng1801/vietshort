import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser, Public } from '../../common/decorators/user.decorator';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Lấy số dư ví' })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Public()
  @Get('gold-packages')
  @ApiOperation({ summary: 'Danh sách gói nạp Gold' })
  async getGoldPackages() {
    return this.walletService.getGoldPackages();
  }
}
