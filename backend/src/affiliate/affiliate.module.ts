import { Module } from '@nestjs/common';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { CommissionService } from './services/commission.service';
import { TrackingService } from './services/tracking.service';
import { WithdrawalService } from './services/withdrawal.service';

@Module({
  controllers: [AffiliateController],
  providers: [AffiliateService, CommissionService, TrackingService, WithdrawalService],
  exports: [AffiliateService, CommissionService, TrackingService],
})
export class AffiliateModule {}

// Alias for backward compatibility with app.module imports
export const CtvModule = AffiliateModule;
