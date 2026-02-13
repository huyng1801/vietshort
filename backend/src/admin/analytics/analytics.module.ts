import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ViewsReport } from './reports/views.report';
import { RevenueReport } from './reports/revenue.report';
import { UserReport } from './reports/user.report';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    ViewsReport,
    RevenueReport,
    UserReport,
  ],
  exports: [
    AnalyticsService,
    ViewsReport,
    RevenueReport,
    UserReport,
  ],
})
export class AnalyticsModule {}
