import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AtomicTransactionService } from './atomic-transaction.service';
import { BalanceProtectionService } from './balance-protection.service';

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    AtomicTransactionService,
    BalanceProtectionService,
  ],
  exports: [
    WalletService,
    AtomicTransactionService,
    BalanceProtectionService,
  ],
})
export class WalletModule {}
