import { Module } from '@nestjs/common';

// ─── Client Feature Modules ────────────────────────────
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { RatingsModule } from './ratings/ratings.module';
import { SearchModule } from './search/search.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { SubtitlesModule } from './subtitles/subtitles.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentModule } from './payment/payment.module';
import { VipModule } from './vip/vip.module';
import { WalletModule } from './wallet/wallet.module';
import { UnlockModule } from './unlock/unlock.module';
import { GamificationModule } from './gamification/gamification.module';
import { ExchangeCodesModule } from './exchange-codes/exchange-codes.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    VideosModule,
    CommentsModule,
    LikesModule,
    RatingsModule,
    SearchModule,
    RecommendationsModule,
    SubtitlesModule,
    NotificationsModule,
    PaymentModule,
    VipModule,
    WalletModule,
    UnlockModule,
    GamificationModule,
    ExchangeCodesModule,
  ],
  exports: [
    AuthModule,
    UsersModule,
    VideosModule,
    CommentsModule,
    LikesModule,
    RatingsModule,
    SearchModule,
    RecommendationsModule,
    SubtitlesModule,
    NotificationsModule,
    PaymentModule,
    VipModule,
    WalletModule,
    UnlockModule,
    GamificationModule,
    ExchangeCodesModule,
  ],
})
export class ClientModule {}
