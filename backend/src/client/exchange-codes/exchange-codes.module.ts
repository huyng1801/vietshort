import { Module } from '@nestjs/common';
import { ExchangeCodesController } from './exchange-codes.controller';
import { ExchangeCodesService } from './exchange-codes.service';
import { CodeBatchService } from './code-batch.service';
import { WalletModule } from '../wallet/wallet.module';
import { VipModule } from '../vip/vip.module';

@Module({
  imports: [WalletModule, VipModule],
  controllers: [ExchangeCodesController],
  providers: [ExchangeCodesService, CodeBatchService],
})
export class ExchangeCodesModule {}
