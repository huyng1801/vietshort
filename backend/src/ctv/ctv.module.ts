import { Module } from '@nestjs/common';
import { AffiliateController } from './affiliate/affiliate.controller';
import { AffiliateService } from './affiliate/affiliate.service';
import { CommissionService } from './affiliate/services/commission.service';
import { TrackingService } from './affiliate/services/tracking.service';
import { WithdrawalService } from './affiliate/services/withdrawal.service';

@Module({
  controllers: [AffiliateController],
  providers: [
    AffiliateService,
    CommissionService,
    TrackingService,
    WithdrawalService,
  ],
  exports: [
    AffiliateService,
    CommissionService,
    TrackingService,
  ],
})
export class CtvModule {}
