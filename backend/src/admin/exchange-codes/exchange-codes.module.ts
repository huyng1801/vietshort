import { Module } from '@nestjs/common';
import { ExchangeCodesController } from './exchange-codes.controller';
import { ExchangeCodesService } from './exchange-codes.service';
import { WalletModule } from '../../client/wallet/wallet.module';
import { VipModule } from '../../client/vip/vip.module';

@Module({
  imports: [WalletModule, VipModule],
  controllers: [ExchangeCodesController],
  providers: [ExchangeCodesService],
})
export class ExchangeCodesModule {}
