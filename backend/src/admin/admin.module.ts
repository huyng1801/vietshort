import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { AuditLogService } from './services/audit-log.service';
import { UserManagementService } from './services/user-management.service';
import { VideoManagementService } from './services/video-management.service';
import { AffiliateManagementService } from './services/affiliate-management.service';
import { AdminAnalyticsService } from './services/analytics.service';
import { CategoryManagementService } from './services/category-management.service';

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
  controllers: [AdminController],
  providers: [
    AdminService, 
    AuditLogService,
    UserManagementService,
    VideoManagementService,
    AffiliateManagementService,
    AdminAnalyticsService,
    CategoryManagementService,
  ],
  exports: [
    AdminService, 
    AuditLogService,
    UserManagementService,
    VideoManagementService,
    AffiliateManagementService,
    AdminAnalyticsService,
    CategoryManagementService,
  ],
})
export class AdminModule {}
