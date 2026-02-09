import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Core modules
import { DatabaseModule } from './config/database.config';
import { RedisModule } from './config/redis.config';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { AdminModule } from './admin/admin.module';
import { CtvModule } from './affiliate/affiliate.module';
import { PaymentModule } from './payment/payment.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { RatingsModule } from './ratings/ratings.module';
import { SearchModule } from './search/search.module';
import { WalletModule } from './wallet/wallet.module';
import { VipModule } from './vip/vip.module';
import { UnlockModule } from './unlock/unlock.module';
import { ExchangeCodesModule } from './exchange-codes/exchange-codes.module';
import { GamificationModule } from './gamification/gamification.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { SubtitlesModule } from './subtitles/subtitles.module';
import { AnalyticsModule } from './analytics/analytics.module';

// Guards and interceptors
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { ThrottlerBehindProxyGuard } from './common/guards/throttle.guard';
import { AuditLogInterceptor } from './common/interceptors/logging.interceptor';

// Configuration
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000,
      limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100'),
    }]),

    // Core modules
    DatabaseModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UsersModule,
    VideosModule,
    AdminModule,
    CtvModule,
    PaymentModule,
    CommentsModule,
    LikesModule,
    RatingsModule,
    SearchModule,
    WalletModule,
    VipModule,
    UnlockModule,
    ExchangeCodesModule,
    GamificationModule,
    NotificationsModule,
    RecommendationsModule,
    SubtitlesModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}