import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { VnpayProvider } from './providers/vnpay.provider';
import { MomoProvider } from './providers/momo.provider';
import { IapProvider } from './providers/iap.provider';
import { WebhookSecurityService } from './webhook-security.service';
import { TransactionIntegrityService } from './transaction-integrity.service';
import { FraudDetectionService } from './fraud-detection.service';
import { ReconciliationService } from './reconciliation.service';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    VnpayProvider,
    MomoProvider,
    IapProvider,
    WebhookSecurityService,
    TransactionIntegrityService,
    FraudDetectionService,
    ReconciliationService,
  ],
  exports: [
    PaymentService, 
    TransactionIntegrityService, 
    FraudDetectionService,
    ReconciliationService,
  ],
})
export class PaymentModule {}
