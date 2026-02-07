## 📦 Cấu trúc dự án ⚠️ **[PRODUCTION-READY ARCHITECTURE]**

### 🚨 **CRITICAL PRODUCTION REQUIREMENTS**
- **Target**: 10,000 concurrent users
- **Uptime**: 99.9% (max 8 hours downtime/month)
- **Performance**: API response <500ms, Video load <3s
- **Security**: Payment PCI compliance, GDPR ready
- **Scalability**: Load balancer + multiple instances + Redis cluster

```
vietshort/
│
├── backend/                           # 🔧 NestJS Backend API (Node.js 20+ LTS)
│   ├── src/
│   │   ├── main.ts                   # Entry point với security middleware
│   │   ├── app.module.ts             # Root module với rate limiting
│   │   ├── app.gateway.ts            # Socket.io gateway cho real-time
│   │   │
│   │   ├── auth/                      # 🔐 Xác thực & ủy quyền [SECURITY CRITICAL]
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts        # JWT strategy với expiration
│   │   │   ├── oauth.strategy.ts      # OAuth bridge (Google, Apple, FB, TikTok)
│   │   │   ├── auth.module.ts
│   │   │   ├── rate-limiter.service.ts # Rate limiting cho login attempts  
│   │   │   ├── session.service.ts      # Session management với Redis
│   │   │   └── dto/
│   │   │       ├── login.dto.ts          # Với input validation
│   │   │       ├── register.dto.ts
│   │   │       ├── refresh-token.dto.ts
│   │   │       └── guest-mode.dto.ts
│   │   │
│   │   ├── users/                     # 👥 Quản lý người dùng
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-profile.dto.ts
│   │   │   │   └── user.dto.ts
│   │   │   └── entities/
│   │   │       ├── user.entity.ts
│   │   │       └── user-device.entity.ts
│   │   │
│   │   ├── videos/                    # 🎬 Video & Streaming
│   │   │   ├── videos.controller.ts
│   │   │   ├── videos.service.ts
│   │   │   ├── videos.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-video.dto.ts
│   │   │   │   ├── update-video.dto.ts
│   │   │   │   └── query-video.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── video.entity.ts
│   │   │   │   └── episode.entity.ts
│   │   │   └── services/
│   │   │       ├── hls-streaming.service.ts  # HLS manifest generation
│   │   │       └── video-queue.service.ts    # Encoding queue
│   │   │
│   │   ├── subtitles/                 # 🤖 Phụ đề tự động
│   │   │   ├── subtitles.controller.ts
│   │   │   ├── subtitles.service.ts
│   │   │   ├── subtitles.module.ts
│   │   │   ├── dto/
│   │   │   │   └── upload-subtitle.dto.ts
│   │   │   └── workers/
│   │   │       ├── whisper.worker.ts
│   │   │       ├── translate.worker.ts
│   │   │       └── sync.worker.ts
│   │   │
│   │   ├── comments/                  # 💬 Bình luận
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── comments.module.ts
│   │   │   └── dto/
│   │   │       ├── create-comment.dto.ts
│   │   │       └── reply.dto.ts
│   │   │
│   │   ├── likes/                     # ❤️ Thích & Yêu thích
│   │   │   ├── likes.controller.ts
│   │   │   ├── likes.service.ts
│   │   │   └── likes.module.ts
│   │   │
│   │   ├── ratings/                   # ⭐ Đánh giá
│   │   │   ├── ratings.controller.ts
│   │   │   ├── ratings.service.ts
│   │   │   └── ratings.module.ts
│   │   │
│   │   ├── payment/                   # 💰 Thanh toán [FINANCIAL SECURITY CRITICAL]
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.module.ts
│   │   │   ├── webhook-security.service.ts  # Signature verification
│   │   │   ├── transaction-integrity.service.ts  # ACID transactions
│   │   │   ├── fraud-detection.service.ts  # Suspicious activity detection
│   │   │   ├── reconciliation.service.ts   # Payment reconciliation
│   │   │   ├── providers/
│   │   │   │   ├── vnpay.provider.ts       # Với signature validation
│   │   │   │   ├── momo.provider.ts        # Với webhook security
│   │   │   │   └── iap.provider.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-payment.dto.ts
│   │   │   │   └── payment-callback.dto.ts
│   │   │   └── entities/
│   │   │       └── transaction.entity.ts   # Với audit trail
│   │   │
│   │   ├── wallet/                    # 🪙 Ví & Tiền tệ ảo [RACE CONDITION PROTECTION]
│   │   │   ├── wallet.controller.ts
│   │   │   ├── wallet.service.ts
│   │   │   ├── wallet.module.ts
│   │   │   ├── atomic-transaction.service.ts  # ACID compliance
│   │   │   ├── balance-protection.service.ts   # Concurrent access protection
│   │   │   └── entities/
│   │   │       └── wallet.entity.ts        # Với optimistic locking
│   │   │
│   │   ├── vip/                       # 💎 VIP & Subscription
│   │   │   ├── vip.controller.ts
│   │   │   ├── vip.service.ts
│   │   │   ├── vip.module.ts
│   │   │   └── entities/
│   │   │       └── vip-subscription.entity.ts
│   │   │
│   │   ├── unlock/                    # 🔓 Mở khóa tập
│   │   │   ├── unlock.controller.ts
│   │   │   ├── unlock.service.ts
│   │   │   └── unlock.module.ts
│   │   │
│   │   ├── exchange-codes/            # 🎟️ Mã trao đổi
│   │   │   ├── exchange-codes.controller.ts
│   │   │   ├── exchange-codes.service.ts
│   │   │   ├── exchange-codes.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-code-batch.dto.ts
│   │   │   │   └── redeem-code.dto.ts
│   │   │   └── entities/
│   │   │       ├── exchange-code.entity.ts
│   │   │       └── code-batch.entity.ts
│   │   │
│   │   ├── recommendations/           # ⭐ Khuyến nghị
│   │   │   ├── recommendations.controller.ts
│   │   │   ├── recommendations.service.ts
│   │   │   ├── recommendations.module.ts
│   │   │   └── algorithms/
│   │   │       ├── collaborative-filter.ts
│   │   │       └── history-based.ts
│   │   │
│   │   ├── search/                    # 🔍 Tìm kiếm
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   └── search.module.ts
│   │   │
│   │   ├── gamification/              # 🎮 Điểm danh & Phần thưởng
│   │   │   ├── daily-check-in.controller.ts
│   │   │   ├── daily-check-in.service.ts
│   │   │   ├── daily-tasks.controller.ts
│   │   │   ├── daily-tasks.service.ts
│   │   │   ├── achievements.controller.ts
│   │   │   ├── achievements.service.ts
│   │   │   ├── gamification.module.ts
│   │   │   └── entities/
│   │   │       ├── daily-check-in.entity.ts
│   │   │       ├── daily-task.entity.ts
│   │   │       └── achievement.entity.ts
│   │   │
│   │   ├── affiliate/                 # 💼 Hệ thống CTV & Affiliate Marketing
│   │   │   ├── affiliate.controller.ts
│   │   │   ├── affiliate.service.ts
│   │   │   ├── affiliate.module.ts
│   │   │   ├── services/
│   │   │   │   ├── commission.service.ts    # Tính toán hoa hồng
│   │   │   │   ├── tracking.service.ts      # Tracking conversions
│   │   │   │   └── withdrawal.service.ts    # Yêu cầu rút tiền
│   │   │   ├── dto/
│   │   │   │   ├── create-affiliate.dto.ts
│   │   │   │   ├── affiliate-stats.dto.ts
│   │   │   │   └── commission.dto.ts
│   │   │   └── entities/
│   │   │       ├── affiliate.entity.ts
│   │   │       ├── affiliate-referral.entity.ts
│   │   │       ├── affiliate-commission.entity.ts
│   │   │       └── affiliate-withdrawal.entity.ts
│   │   │
│   │   ├── analytics/                 # 📊 Phân tích & Thống kê
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.module.ts
│   │   │   └── reports/
│   │   │       ├── views.report.ts
│   │   │       ├── revenue.report.ts
│   │   │       └── user.report.ts
│   │   │
│   │   ├── notifications/             # 🔔 Thông báo
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.module.ts
│   │   │   ├── providers/
│   │   │   │   ├── firebase.provider.ts
│   │   │   │   └── email.provider.ts
│   │   │   └── dto/
│   │   │       └── send-notification.dto.ts
│   │   │
│   │   ├── admin/                     # 🎛️ API quản trị
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.module.ts
│   │   │   ├── services/
│   │   │   │   ├── user-management.service.ts
│   │   │   │   ├── video-management.service.ts
│   │   │   │   ├── affiliate-management.service.ts   # Quản lý CTV
│   │   │   │   ├── analytics.service.ts
│   │   │   │   └── audit-log.service.ts
│   │   │   └── dto/
│   │   │       ├── user-management.dto.ts
│   │   │       ├── content-management.dto.ts
│   │   │       ├── affiliate-management.dto.ts
│   │   │       └── admin-logs.dto.ts
│   │   │
│   │   ├── common/                    # 🔧 Tiện ích chung [SECURITY ENHANCED]
│   │   │   ├── guards/
│   │   │   │   ├── jwt.guard.ts           # Với rate limiting
│   │   │   │   ├── roles.guard.ts         # Permission matrix
│   │   │   │   ├── auth.guard.ts          # Multi-factor protection
│   │   │   │   └── throttle.guard.ts      # API rate limiting
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts # Audit trail
│   │   │   │   ├── transform.interceptor.ts
│   │   │   │   ├── error.interceptor.ts   # Error sanitization
│   │   │   │   └── cache.interceptor.ts   # Redis caching
│   │   │   ├── middleware/
│   │   │   │   ├── logger.middleware.ts
│   │   │   │   ├── rate-limit.middleware.ts  # Request throttling
│   │   │   │   ├── cors.middleware.ts        # Secure CORS
│   │   │   │   └── helmet.middleware.ts      # Security headers
│   │   │   ├── exceptions/
│   │   │   │   ├── custom-exceptions.ts
│   │   │   │   └── validation-exceptions.ts   # Input validation errors
│   │   │   ├── decorators/
│   │   │   │   ├── user.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   └── utils/
│   │   │       ├── validators.ts
│   │   │       └── helpers.ts
│   │   │
│   │   ├── config/                    # ⚙️ Config [PRODUCTION SECURITY]
│   │   │   ├── database.config.ts         # Master-slave connection config
│   │   │   ├── jwt.config.ts              # Secure JWT settings
│   │   │   ├── payment.config.ts          # Payment gateway credentials
│   │   │   ├── redis.config.ts            # Redis cluster configuration
│   │   │   ├── cloudflare.config.ts       # CDN settings
│   │   │   ├── security.config.ts         # Security policies
│   │   │   └── monitoring.config.ts       # APM & logging config
│   │   │
│   │   └── prisma/                    # 📦 Prisma ORM [DATABASE OPTIMIZED]
│   │       ├── schema.prisma              # Với proper indexes & relations
│   │       ├── migrations/                # Production-ready migrations
│   │       └── seeds/                     # Database seeding scripts
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── docker/
│       └── Dockerfile
│
│
├── frontend-web/                      # 🌐 Next.js 15 Customer Web
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Trang chủ
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── oauth-callback/
│   │   │   │       └── page.tsx
│   │   │   ├── (main)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── videos/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx   # Chi tiết phim
│   │   │   │   │   └── watch/
│   │   │   │   │       └── [id]/
│   │   │   │   │           └── page.tsx # Video player
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── category/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── account/
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── history/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── bookmarks/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── vip/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── wallet/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── rewards/
│   │   │   │       ├── daily-check-in/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── tasks/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── achievements/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   └── error.tsx             # Error boundary
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── OAuthButtons.tsx
│   │   │   ├── video/
│   │   │   │   ├── VideoPlayer.tsx    # HLS + Video.js
│   │   │   │   ├── SubtitleControl.tsx
│   │   │   │   ├── QualitySelector.tsx
│   │   │   │   ├── GestureHandler.tsx
│   │   │   │   ├── VideoCard.tsx
│   │   │   │   └── VideoGrid.tsx
│   │   │   ├── movies/
│   │   │   │   ├── MovieDetails.tsx
│   │   │   │   ├── EpisodeSelector.tsx
│   │   │   │   ├── MovieBanner.tsx
│   │   │   │   └── MovieTrendingCarousel.tsx
│   │   │   ├── social/
│   │   │   │   ├── LikeButton.tsx
│   │   │   │   ├── BookmarkButton.tsx
│   │   │   │   ├── RatingComponent.tsx
│   │   │   │   ├── CommentSection.tsx
│   │   │   │   ├── ShareButtons.tsx
│   │   │   │   └── CommentInput.tsx
│   │   │   ├── payment/
│   │   │   │   ├── PaymentModal.tsx
│   │   │   │   ├── VIPCard.tsx
│   │   │   │   ├── UnlockModal.tsx
│   │   │   │   └── WalletDisplay.tsx
│   │   │   ├── rewards/
│   │   │   │   ├── DailyCheckInCard.tsx
│   │   │   │   ├── DailyTasksList.tsx
│   │   │   │   ├── AchievementBadge.tsx
│   │   │   │   └── RewardPopup.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── home/
│   │   │   │   ├── BannerSection.tsx
│   │   │   │   ├── TrendingSection.tsx
│   │   │   │   ├── CategoriesSection.tsx
│   │   │   │   ├── RecommendationsSection.tsx
│   │   │   │   └── PromotionalBanner.tsx
│   │   │   └── common/
│   │   │       ├── Loading.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── Pagination.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useVideo.ts
│   │   │   ├── usePayment.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useGestures.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts              # API client
│   │   │   ├── auth.ts             # Auth utilities
│   │   │   ├── validators.ts       # Form validators
│   │   │   ├── constants.ts        # Constants
│   │   │   └── utils.ts            # Helpers
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts        # Zustand auth
│   │   │   ├── userStore.ts        # User data
│   │   │   ├── videoStore.ts       # Video state
│   │   │   ├── cartStore.ts        # Payment cart
│   │   │   └── uiStore.ts          # UI state
│   │   │
│   │   ├── types/
│   │   │   ├── api.ts
│   │   │   ├── user.ts
│   │   │   ├── video.ts
│   │   │   ├── payment.ts
│   │   │   └── common.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   └── animations.css
│   │   │
│   │   └── i18n/
│   │       ├── locales/
│   │       │   ├── vi.json
│   │       │   ├── en.json
│   │       │   └── zh.json
│   │       └── i18n.config.ts
│   │
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── videos/
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
│
├── admin-cms/                         # 🎛️ Next.js 15 Admin Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Dashboard home
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx           # Main dashboard
│   │   │   │   ├── videos/
│   │   │   │   │   ├── page.tsx       # Video list
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx   # Edit video
│   │   │   │   │   └── upload/
│   │   │   │   │       └── page.tsx   # Upload
│   │   │   │   ├── subtitles/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── banners/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── categories/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── users/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── views/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── revenue/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── users/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── languages/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── vip-pricing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── admin-users/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── ctv-management/
│   │   │   │   │   ├── page.tsx           # Danh sách CTV
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx       # Chi tiết CTV
│   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── commissions/
│   │   │   │   │   │   │   └── page.tsx   # Quản lý hoa hồng
│   │   │   │   │   │   └── withdrawals/
│   │   │   │   │   │       └── page.tsx   # Duyệt rút tiền
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── commissions-approval/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── exchange-codes/
│   │   │   │   │   ├── page.tsx           # Mã trao đổi
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── redemptions/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── encoding-queue/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── error.tsx             # Error boundary
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AdminHeader.tsx
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   └── AdminLayout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── ChartWidget.tsx
│   │   │   │   ├── RecentActivity.tsx
│   │   │   │   └── TopVideos.tsx
│   │   │   ├── videos/
│   │   │   │   ├── VideoUploadForm.tsx
│   │   │   │   ├── VideoEditForm.tsx
│   │   │   │   ├── VideoTable.tsx
│   │   │   │   ├── EncodingQueueTable.tsx
│   │   │   │   └── VideoPreview.tsx
│   │   │   ├── subtitles/
│   │   │   │   ├── SubtitleUpload.tsx
│   │   │   │   ├── SubtitleEditor.tsx     # Monaco Editor
│   │   │   │   └── SubtitleMapping.tsx
│   │   │   ├── banners/
│   │   │   │   ├── BannerForm.tsx
│   │   │   │   ├── BannerTable.tsx
│   │   │   │   └── BannerPreview.tsx
│   │   │   ├── users/
│   │   │   │   ├── UserTable.tsx
│   │   │   │   ├── UserDetails.tsx
│   │   │   │   ├── UserFilters.tsx
│   │   │   │   └── WalletManager.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── ViewsChart.tsx        # Recharts
│   │   │   │   ├── RevenueChart.tsx
│   │   │   │   ├── UserGrowthChart.tsx
│   │   │   │   └── TopVideosChart.tsx
│   │   │   ├── ctv/
│   │   │   │   ├── CTVTable.tsx
│   │   │   │   ├── CTVForm.tsx
│   │   │   │   ├── CTVDetails.tsx
│   │   │   │   ├── CommissionTable.tsx
│   │   │   │   ├── WithdrawalTable.tsx
│   │   │   │   ├── CommissionCalculator.tsx
│   │   │   │   └── CTVPerformanceChart.tsx
│   │   │   ├── exchange-codes/
│   │   │   │   ├── CodeBatchForm.tsx
│   │   │   │   ├── CodeBatchTable.tsx
│   │   │   │   ├── CodeRedemptionTable.tsx
│   │   │   │   └── CodeExportButton.tsx
│   │   │   └── common/
│   │   │       ├── DataTable.tsx
│   │   │       ├── FormBuilder.tsx
│   │   │       ├── FilterBar.tsx
│   │   │       └── ExportButton.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAdminAuth.ts
│   │   │   ├── useAdminAPI.ts
│   │   │   ├── usePagination.ts
│   │   │   └── useFilters.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── admin-api.ts
│   │   │   ├── admin-auth.ts
│   │   │   └── admin-utils.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── adminAuthStore.ts
│   │   │   ├── adminVideoStore.ts
│   │   │   └── adminUIStore.ts
│   │   │
│   │   ├── types/
│   │   │   ├── admin.ts
│   │   │   └── dashboard.ts
│   │   │
│   │   └── styles/
│   │       ├── globals.css
│   │       └── admin.css
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
│
├── ctv-portal/                        # 🤝 Next.js 15 Cổng đối tác CTV [DEDICATED PARTNER PORTAL]
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Layout chứng chỉ với security headers
│   │   │   ├── page.tsx               # Trang chủ CTV
│   │   │   ├── login/
│   │   │   │   ├── page.tsx           # Đăng nhập riêng với OTP
│   │   │   │   └── forgot-password/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx         # Dashboard layout chứng chỉ
│   │   │   │   ├── page.tsx           # Bảng điều khiển tổng quát (thời gian thực)
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── page.tsx       # Hiệu suất chi tiết (clicks, conversions, revenue)
│   │   │   │   │   ├── performance/
│   │   │   │   │   │   └── page.tsx   # Trending & performance metrics
│   │   │   │   │   ├── sources/
│   │   │   │   │   │   └── page.tsx   # Phân tích nguồn truy cập
│   │   │   │   │   ├── devices/
│   │   │   │   │   │   └── page.tsx   # Thiết bị & hệ điều hành
│   │   │   │   │   └── geo/
│   │   │   │   │       └── page.tsx   # Phân tích địa lý
│   │   │   │   ├── links/
│   │   │   │   │   ├── page.tsx       # Quản lý link referral (UTM, QR, short URL)
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx   # Tạo link với deep linking
│   │   │   │   │   ├── analytics/
│   │   │   │   │   │   └── page.tsx   # Chi tiết click & conversion từng link
│   │   │   │   │   └── ab-testing/
│   │   │   │   │       └── page.tsx   # So sánh hiệu suất link khác nhau
│   │   │   │   ├── commissions/
│   │   │   │   │   ├── page.tsx       # Theo dõi hoa hồng (chi tiết theo giao dịch)
│   │   │   │   │   ├── history/
│   │   │   │   │   │   └── page.tsx   # Lịch sử minh bạch
│   │   │   │   │   ├── calculator/
│   │   │   │   │   │   └── page.tsx   # Máy tính ước tính hoa hồng
│   │   │   │   │   └── milestones/
│   │   │   │   │       └── page.tsx   # Bonus theo mức doanh số
│   │   │   │   ├── withdrawals/
│   │   │   │   │   ├── page.tsx       # Yêu cầu rút tiền (bank, Momo, VNPay)
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx   # Form rút tiền
│   │   │   │   │   └── status/
│   │   │   │   │       └── page.tsx   # Theo dõi trạng thái chi trả
│   │   │   │   ├── reports/
│   │   │   │   │   ├── page.tsx       # Báo cáo tổng quát
│   │   │   │   │   ├── daily/
│   │   │   │   │   │   └── page.tsx   # Báo cáo hàng ngày
│   │   │   │   │   ├── monthly/
│   │   │   │   │   │   └── page.tsx   # Báo cáo hàng tháng
│   │   │   │   │   ├── custom/
│   │   │   │   │   │   └── page.tsx   # Báo cáo tùy chỉnh
│   │   │   │   │   └── export/
│   │   │   │   │       └── page.tsx   # Xuất CSV, Excel, PDF
│   │   │   │   ├── materials/
│   │   │   │   │   ├── page.tsx       # Tài liệu marketing (thư viện)
│   │   │   │   │   ├── banners/
│   │   │   │   │   │   └── page.tsx   # Banner (đa kích thước, tracking codes)
│   │   │   │   │   ├── videos/
│   │   │   │   │   │   └── page.tsx   # Video quảng cáo (optimized cho social)
│   │   │   │   │   ├── templates/
│   │   │   │   │   │   └── page.tsx   # Mẫu nội dung (Facebook, TikTok, Email)
│   │   │   │   │   └── guides/
│   │   │   │   │       └── page.tsx   # Hướng dẫn tối ưu & best practices
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx       # Thiết lập tài khoản
│   │   │   │       ├── profile/
│   │   │   │       │   └── page.tsx   # Hồ sơ công ty
│   │   │   │       ├── bank-account/
│   │   │   │       │   └── page.tsx   # Tài khoản rút tiền
│   │   │   │       └── notifications/
│   │   │   │           └── page.tsx   # Tùy chọn thông báo
│   │   │   │
│   │   │   └── error.tsx             # Error boundary
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── CTVHeader.tsx       # Header với security menu
│   │   │   │   ├── CTVSidebar.tsx      # Sidebar với 7+ mục chính
│   │   │   │   └── CTVLayout.tsx       # Layout responsive
│   │   │   ├── dashboard/
│   │   │   │   ├── RealTimeMetrics.tsx # Số liệu thời gian thực
│   │   │   │   ├── MetricsGrid.tsx     # Grid hiệu suất chính
│   │   │   │   ├── PerformanceChart.tsx # Biểu đồ xu hướng
│   │   │   │   ├── ConversionFunnel.tsx #漏斗chuyển đổi
│   │   │   │   ├── RankingCard.tsx     # Thứ hạng so với CTV khác
│   │   │   │   └── RecentReferrals.tsx # Lưu hàng xuất thảo gần đây
│   │   │   ├── analytics/
│   │   │   │   ├── ClicksChart.tsx     # Biểu đồ lượt click
│   │   │   │   ├── ConversionsChart.tsx # Biểu đồ chuyển đổi
│   │   │   │   ├── RevenueChart.tsx    # Biểu đồ doanh thu
│   │   │   │   ├── CommissionChart.tsx # Biểu đồ hoa hồng
│   │   │   │   ├── SourceAnalytics.tsx # Phân tích bởi nguồn
│   │   │   │   └── DeviceAnalytics.tsx # Phân tích bởi thiết bị
│   │   │   ├── links/
│   │   │   │   ├── LinkGenerator.tsx   # Tạo link với UTM & tracking
│   │   │   │   ├── LinkTable.tsx       # Danh sách link
│   │   │   │   ├── LinkCopyButton.tsx  # Copy link
│   │   │   │   ├── LinkQRCode.tsx      # QR code generation
│   │   │   │   ├── DeepLinkBuilder.tsx # Deep linking configurator
│   │   │   │   └── LinkAnalytics.tsx   # Chi tiết hiệu suất link
│   │   │   ├── commissions/
│   │   │   │   ├── CommissionDisplay.tsx # Hiển thị hoa hồng
│   │   │   │   ├── CommissionHistory.tsx # Lịch sử giao dịch
│   │   │   │   ├── CommissionCalculator.tsx # Máy tính hoa hồng
│   │   │   │   ├── MilestoneTracker.tsx # Theo dõi mục tiêu bonus
│   │   │   │   └── TransactionDetail.tsx # Chi tiết từng giao dịch
│   │   │   ├── withdrawals/
│   │   │   │   ├── WithdrawalForm.tsx  # Form rút tiền
│   │   │   │   ├── WithdrawalTable.tsx # Lịch sử rút tiền
│   │   │   │   ├── WithdrawalStatus.tsx # Trạng thái chi trả
│   │   │   │   └── BankAccountSetup.tsx # Cấu hình tài khoản
│   │   │   ├── materials/
│   │   │   │   ├── BannerLibrary.tsx   # Thư viện banner
│   │   │   │   ├── VideoLibrary.tsx    # Thư viện video
│   │   │   │   ├── ContentTemplate.tsx # Mẫu nội dung
│   │   │   │   └── ContentGuide.tsx    # Hướng dẫn tối ưu
│   │   │   └── common/
│   │   │       ├── DataTable.tsx
│   │   │       ├── FilterBar.tsx
│   │   │       ├── ExportButton.tsx
│   │   │       ├── DateRangePicker.tsx
│   │   │       └── TrendIndicator.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useCTVAuth.ts
│   │   │   ├── useCTVAPI.ts
│   │   │   ├── useMetrics.ts
│   │   │   └── useCommission.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── ctv-api.ts
│   │   │   ├── ctv-auth.ts
│   │   │   └── ctv-utils.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── ctvAuthStore.ts
│   │   │   ├── metricsStore.ts
│   │   │   └── ctvUIStore.ts
│   │   │
│   │   ├── types/
│   │   │   ├── ctv.ts
│   │   │   ├── metrics.ts
│   │   │   ├── commission.ts
│   │   │   ├── referral.ts
│   │   │   └── withdrawal.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── ctv.css
│   │   │   └── charts.css
│   │   │
│   │   ├── utils/
│   │   │   ├── ctv-metrics.ts
│   │   │   ├── ctv-commission.ts
│   │   │   ├── date-formatter.ts
│   │   │   └── export-helpers.ts
│   │   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
│
│   ├── API.md                        # API documentation
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── ARCHITECTURE.md               # Architecture overview
│   ├── AUTO_SUBTITLE.md              # Subtitle system
│   ├── DATABASE.md                   # Database schema
│   ├── SETUP.md                      # Local setup guide
│   ├── ENV_VARIABLES.md              # Environment variables
│   └── API_EXAMPLES.md               # cURL/Postman examples
│
├── docker/                           # Container Configuration [PRODUCTION READY]
│   ├── docker-compose.yml            # Local development với all services
│   ├── docker-compose.prod.yml       # Production với load balancing
│   ├── docker-compose.monitoring.yml # Monitoring stack
│   ├── backend.Dockerfile            # Optimized backend image
│   ├── frontend.Dockerfile           # Optimized frontend image
│   ├── admin.Dockerfile              # Admin dashboard image
│   ├── nginx.Dockerfile              # Load balancer image
│   └── redis-cluster.Dockerfile      # Redis cluster image
│
├── scripts/                          # Automation Scripts [PRODUCTION READY]
│   ├── setup.sh                      # Project setup với security checks
│   ├── migrate.sh                    # Database migration với rollback
│   ├── seed.sh                       # Seed data với validation
│   ├── build.sh                      # Build all projects với testing
│   ├── deploy.sh                     # Zero-downtime deployment
│   ├── health-check.sh               # System health validation
│   ├── backup.sh                     # Automated backup script
│   ├── load-test.sh                  # Performance testing
│   ├── security-audit.sh             # Security vulnerability scan
│   └── monitoring-setup.sh           # Monitoring stack deployment
│
├── infra/                            # Infrastructure as Code [NEW - CRITICAL]
│   ├── nginx/                        # Load Balancer Configuration 
│   │   ├── nginx.conf                 # Main config với load balancing
│   │   ├── vhost/
│   │   │   ├── www.conf               # Customer web config
│   │   │   ├── api.conf               # API load balancer config  
│   │   │   ├── admin.conf             # Admin panel config
│   │   │   └── ctv.conf               # CTV portal config
│   │   ├── ssl/
│   │   │   └── certificates/          # Let's Encrypt automation
│   │   └── rate-limiting.conf         # DDoS protection rules
│   ├── database/                     # Database Configuration
│   │   ├── master.cnf                 # MySQL master config
│   │   ├── slave.cnf                  # MySQL slave config
│   │   ├── backup.sh                  # Automated backup script
│   │   └── performance-tuning.sql     # Index optimization
│   ├── redis/                        # Redis Cluster Configuration
│   │   ├── redis-cluster.conf         # Main cluster config
│   │   ├── master.conf                # Master node config
│   │   └── sentinel.conf              # Sentinel failover config
│   ├── monitoring/                   # Monitoring Stack
│   │   ├── prometheus.yml             # Metrics collection
│   │   ├── grafana/                   # Dashboards
│   │   ├── alertmanager.yml           # Alert routing
│   │   └── elk-stack/                 # Log aggregation
│   └── security/                     # Security Configuration
│       ├── waf-rules.conf             # Web Application Firewall
│       ├── fail2ban.conf              # Intrusion prevention
│       └── cloudflare-rules.json      # DDoS protection
│
├── .github/                          # CI/CD Pipeline [PRODUCTION AUTOMATION]
│   ├── workflows/
│   │   ├── ci.yml                   # CI/CD pipeline với security scanning
│   │   ├── test.yml                 # Automated testing với coverage
│   │   ├── security-scan.yml       # Security vulnerability scanning
│   │   ├── load-test.yml           # Performance testing
│   │   └── deploy.yml              # Zero-downtime deployment
│   └── PULL_REQUEST_TEMPLATE.md
│
└── tests/                            # Testing Suite [PRODUCTION QUALITY]
    ├── unit/                         # Unit tests với 90%+ coverage
    ├── integration/                  # API integration tests
    ├── e2e/                          # End-to-end testing
    ├── load/                         # Load testing scripts (10k users)
    ├── security/                     # Security penetration tests
    └── payment/                      # Payment flow testing
```

### 💡 **PRODUCTION ARCHITECTURE HIGHLIGHTS**

**🔐 Security Layer:**
- WAF + DDoS protection (Cloudflare)
- Input validation + SQL injection protection
- Payment webhook signature verification
- Rate limiting + account lockout
- Audit logging với tamper protection

**⚡ Scalability Layer:**
- Load balancer (Nginx) + multiple backend instances
- Master-slave MySQL replication
- Redis cluster cho session + caching
- CDN với 95%+ cache hit ratio
- Auto-scaling based on metrics

**📊 Monitoring Layer:**
- Real-time error tracking (Sentry)
- Performance monitoring (APM)
- Business metrics dashboard
- Health checks + alerting
- 99.9% uptime monitoring

**🛡️ Reliability Layer:**
- Automated backup + disaster recovery
- Zero-downtime deployment
- Circuit breaker patterns
- Retry mechanisms với exponential backoff
- Graceful degradation strategies