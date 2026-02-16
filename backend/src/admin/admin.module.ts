import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Core admin
import { AdminController } from './core/admin.controller';
import { AdminService } from './core/admin.service';

// Users sub-module
import { AdminUsersController } from './users/users.controller';
import { UserManagementService } from './users/user-management.service';

// Videos sub-module
import { AdminVideoController } from './videos/admin-video.controller';
import { AdminVideoReviewController } from './videos/video-review.controller';
import { AdminSubtitleController } from './videos/admin-subtitle.controller';
import { AdminVideoService } from './videos/services/admin-video.service';
import { VideoManagementService } from './videos/video-management.service';
import { R2StorageService } from './videos/services/r2-storage.service';
import { VideoQueueService } from './videos/services/video-queue.service';
import { EncodeWorkerService } from './videos/services/encode-worker.service';
import { SubtitleService } from './videos/services/subtitle.service';
import { SubtitleWorkerService } from './videos/services/subtitle-worker.service';

// Genres sub-module
import { AdminGenresController } from './genres/genres.controller';
import { GenresManagementService } from './genres/genres.service';

// Banners sub-module
import { AdminBannersController } from './banners/banners.controller';
import { BannerManagementService } from './banners/banner-management.service';

// Payouts sub-module
import { AdminPayoutsController } from './payouts/payouts.controller';
import { AffiliateManagementService } from './payouts/affiliate-management.service';

// Audit logs sub-module
import { AdminAuditLogsController } from './audit-logs/audit-logs.controller';
import { AuditLogService } from './audit-logs/audit-log.service';

// Analytics sub-module
import { AnalyticsController } from './analytics/analytics.controller';
import { AdminAnalyticsService } from './analytics/services/admin-analytics.service';
import { AnalyticsService } from './analytics/analytics.service';
import { ViewsReport } from './analytics/reports/views.report';
import { RevenueReport } from './analytics/reports/revenue.report';
import { UserReport } from './analytics/reports/user.report';

// Gamification sub-module
import { AdminGamificationController } from './gamification/gamification.controller';
import { GamificationManagementService } from './gamification/gamification-management.service';

// Social management sub-module
import { AdminSocialController } from './social/social.controller';
import { SocialManagementService } from './social/social-management.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '4h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminVideoController,
    AdminVideoReviewController,
    AdminSubtitleController,
    AdminGenresController,
    AdminBannersController,
    AdminPayoutsController,
    AdminAuditLogsController,
    AnalyticsController,
    AdminGamificationController,
    AdminSocialController,
  ],
  providers: [
    AdminService,
    UserManagementService,
    AdminVideoService,
    VideoManagementService,
    R2StorageService,
    VideoQueueService,
    EncodeWorkerService,
    SubtitleService,
    SubtitleWorkerService,
    GenresManagementService,
    BannerManagementService,
    AffiliateManagementService,
    AuditLogService,
    AdminAnalyticsService,
    AnalyticsService,
    ViewsReport,
    RevenueReport,
    UserReport,
    GamificationManagementService,
    SocialManagementService,
  ],
  exports: [
    AdminService,
    UserManagementService,
    AdminVideoService,
    VideoManagementService,
    R2StorageService,
    VideoQueueService,
    GenresManagementService,
    BannerManagementService,
    AffiliateManagementService,
    AuditLogService,
    AdminAnalyticsService,
    AnalyticsService,
    GamificationManagementService,
  ],
})
export class AdminModule {}
