// ===== Admin Types =====

export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  role: AdminRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  permissions?: string[];
  lastLoginAt?: string;
  createdAt?: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'MODERATOR';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

// ===== Video Types =====
export interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string;
  poster?: string;
  duration?: number;
  releaseYear?: number;
  director?: string;
  actors?: string;
  country?: string;
  language?: string;
  genres?: string;
  isSerial: boolean;
  totalEpisodes?: number;
  ageRating: string;
  isVipOnly: boolean;
  vipTier?: string;
  unlockPrice?: number;
  status: VideoStatus;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  favoriteCount: number;
  commentCount: number;
  ratingAverage: number;
  ratingCount: number;
  episodes?: Episode[];
  videoGenres?: { genre: Genre }[];
  _count?: { episodes: number; comments: number; likes: number; favorites: number };
  createdAt: string;
  updatedAt: string;
}

export type VideoStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';
export type EncodingStatusType = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Episode {
  id: string;
  videoId: string;
  episodeNumber: number;
  title?: string;
  description?: string;
  sourceUrl?: string;
  hlsManifest?: string;
  mp4Url?: string;
  unlockPrice?: number;
  encodingStatus: EncodingStatusType;
  encodingProgress: number;
  encodingError?: string;
  duration?: number;
  subtitles?: Subtitle[];
  video?: { id: string; title: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

export type SubtitleStatusType = 'READY' | 'QUEUED' | 'EXTRACTING' | 'TRANSCRIBING' | 'TRANSLATING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';

export interface Subtitle {
  id: string;
  episodeId: string;
  language: string;
  label?: string;
  content?: string;
  srtUrl?: string;
  isAuto: boolean;
  status: SubtitleStatusType;
  progress: number;
  error?: string;
  episode?: {
    id: string;
    episodeNumber: number;
    title?: string;
    videoId: string;
    video?: { id: string; title: string; slug: string };
  };
  createdAt: string;
  updatedAt?: string;
}

export interface SubtitleQueueStatus {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  breakdown: {
    extracting: number;
    transcribing: number;
    translating: number;
    uploading: number;
  };
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoGenre {
  videoId: string;
  genreId: string;
  genre: Genre;
}

export interface EncodingJob {
  id: string;
  videoId: string;
  episodeNumber: number;
  title?: string;
  encodingStatus: EncodingStatusType;
  encodingProgress: number;
  encodingError?: string;
  video: { id: string; title: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

// ===== Banner Types =====
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkType: 'video' | 'external' | 'promotion';
  linkTarget?: string;
  sortOrder: number;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
  targetVipType?: 'VIP_FREEADS' | 'VIP_GOLD' | null;
  createdAt: string;
  updatedAt: string;
}

// ===== Category Types =====
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { videos: number };
  createdAt: string;
  updatedAt: string;
}

// ===== Genre Types =====
export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  videoCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ===== User Types =====
export type VipType = 'VIP_GOLD' | null;
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: string;
  email?: string;
  nickname: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  
  // VIP và Balance
  vipTier?: VipType;
  vipExpiresAt?: string;
  goldBalance: number;
  
  // Authentication
  isEmailVerified: boolean;
  isActive: boolean;
  isLocked: boolean;
  lockReason?: string;
  lockedAt?: string;
  lockedBy?: string;
  
  // OAuth providers
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  tiktokId?: string;
  
  // Device tracking
  deviceId?: string;
  
  // Registration tracking
  registrationSource?: string;
  registrationIp?: string;
  
  // Additional info
  country?: string;
  timezone?: string;
  language: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // Counts
  _count?: {
    ratings: number;
    comments: number;
    transactions: number;
    watchHistory: number;
    favorites: number;
  };
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  rewardValue?: number;
  provider?: string;
  status: TransactionStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'PAYMENT' | 'REFUND' | 'ADMIN_ADJUST' | 'BONUS' | 'EXCHANGE_REDEEM' | 'VIDEO_UNLOCK' | 'VIP_UPGRADE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// ===== CTV / Affiliate Types =====
export type AffiliateType = 'COMPANY' | 'INDIVIDUAL';

export interface Affiliate {
  id: string;
  email: string;
  nickname: string;
  companyName?: string;
  realName: string;
  phone?: string;
  bankAccount?: string;
  bankName?: string;

  // 3-tier hierarchy
  parentId?: string | null;
  tier: number; // 1 = Company, 2 = Sub-affiliate, 3 = Sub-sub-affiliate
  affiliateType: AffiliateType;
  networkEarned: number;
  networkMembers: number;
  contractNotes?: string | null;
  contractStartAt?: string | null;
  contractEndAt?: string | null;

  // Commission settings
  commissionRate: number;
  totalEarned: number;
  pendingPayout: number;
  paidOut: number;

  // Tracking
  referralCode: string;
  referralUrl: string;

  // Stats
  totalClicks: number;
  totalRegistrations: number;
  totalPurchasers: number;

  // Status
  isActive: boolean;
  isVerified: boolean;

  createdAt: string;
  updatedAt: string;

  // Relations (optional)
  parent?: {
    id: string;
    realName: string;
    nickname: string;
    companyName?: string;
    tier: number;
    commissionRate?: number;
  } | null;
  children?: Affiliate[];
  referrals?: CtvReferral[];
  payouts?: CtvPayout[];
  _count?: {
    referrals: number;
    payouts: number;
    children: number;
  };
}

export interface NetworkStats {
  networkMembers: number;
  networkTotalEarned: number;
  networkTotalClicks: number;
  networkTotalRegistrations: number;
  networkTotalPurchasers: number;
  ownEarned: number;
  ownClicks: number;
  ownRegistrations: number;
  ownPurchasers: number;
}

export interface CtvReferral {
  id: string;
  affiliateId: string;
  userId: string;
  clickedAt?: string;
  registeredAt?: string;
  firstPurchaseAt?: string;
  totalRevenue: number;
  totalCommission: number;
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nickname: string;
    email?: string;
    avatar?: string;
  };
}

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface CtvPayout {
  id: string;
  affiliateId: string;
  amount: number;
  status: PayoutStatus;
  bankAccount: string;
  bankName: string;
  notes?: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  affiliate?: {
    id: string;
    realName: string;
    nickname: string;
    tier?: number;
    companyName?: string;
  };
}

// ===== Exchange Code Types =====
export interface ExchangeCode {
  id: string;
  code: string;
  batchId?: string;
  batchName?: string;
  rewardType: 'GOLD' | 'VIP_DAYS';
  rewardValue: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CodeBatch {
  id: string;
  batchName: string;
  rewardType: 'GOLD' | 'VIP_DAYS';
  rewardValue: number;
  quantity: number;
  usageLimit: number;
  codeLength: number;
  codePrefix?: string;
  isActive: boolean;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  // Computed stats
  totalCodes: number;
  usedCodes: number;
  remainingCodes: number;
  usagePercentage: number;
  // Detail view
  codes?: ExchangeCode[];
}

export interface CodeRedemption {
  id: string;
  codeId?: string;
  code: string;
  userId: string;
  userNickname: string;
  rewardType: string;
  rewardValue: number;
  deviceType?: string;
  ipAddress?: string;
  redeemedAt: string;
}

// ===== Analytics Types =====
export interface AnalyticsSummary {
  totalUsers: number;
  newUsersToday: number;
  totalVideos: number;
  totalViews: number;
  totalRevenue: number;
  todayRevenue: number;
  activeVipUsers: number;
  onlineUsers: number;
}

// ===== Common Types =====
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface TableParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// ===== Gamification Types =====

export type DailyTaskType = 'WATCH_VIDEO' | 'LIKE_VIDEO' | 'COMMENT' | 'SHARE' | 'WATCH_AD' | 'RATE_VIDEO';

export type AchievementCondition =
  | 'FIRST_COMMENT' | 'FIRST_LIKE' | 'FIRST_SHARE'
  | 'WATCH_EPISODES' | 'WATCH_MINUTES'
  | 'TOTAL_COMMENTS' | 'TOTAL_SHARES'
  | 'VIP_SUBSCRIBE' | 'GOLD_SPENT'
  | 'STREAK_CHECKIN' | 'FOLLOW_SOCIAL';

export interface DailyTask {
  id: string;
  name: string;
  description?: string;
  taskType: DailyTaskType;
  targetCount: number;
  rewardGold: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { progress: number };
}

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  category?: string;
  conditionType: AchievementCondition;
  conditionValue: number;
  rewardGold: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { userAchievements: number };
}

export interface CheckInReward {
  id: string;
  day: number;
  rewardGold: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GamificationOverview {
  dailyTasks: {
    totalTasks: number;
    activeTasks: number;
    todayCompletions: number;
    todayClaims: number;
  };
  achievements: {
    totalAchievements: number;
    activeAchievements: number;
    totalUnlocked: number;
    topAchievements: Achievement[];
  };
  checkIns: {
    totalCheckIns: number;
    todayCheckIns: number;
    weekCheckIns: number;
    totalGoldGiven: number;
  };
}

export const DAILY_TASK_TYPE_LABELS: Record<DailyTaskType, string> = {
  WATCH_VIDEO: 'Xem video',
  LIKE_VIDEO: 'Thích video',
  COMMENT: 'Bình luận',
  SHARE: 'Chia sẻ',
  WATCH_AD: 'Xem quảng cáo',
  RATE_VIDEO: 'Đánh giá',
};

export const ACHIEVEMENT_CONDITION_LABELS: Record<AchievementCondition, string> = {
  FIRST_COMMENT: 'Bình luận đầu tiên',
  FIRST_LIKE: 'Thích đầu tiên',
  FIRST_SHARE: 'Chia sẻ đầu tiên',
  WATCH_EPISODES: 'Xem tập phim',
  WATCH_MINUTES: 'Thời gian xem (phút)',
  TOTAL_COMMENTS: 'Tổng bình luận',
  TOTAL_SHARES: 'Tổng chia sẻ',
  VIP_SUBSCRIBE: 'Đăng ký VIP',
  GOLD_SPENT: 'Tiêu vàng',
  STREAK_CHECKIN: 'Điểm danh liên tục',
  FOLLOW_SOCIAL: 'Theo dõi MXH',
};

export const ACHIEVEMENT_CATEGORY_LABELS: Record<string, string> = {
  social: 'Xã hội',
  watch: 'Xem phim',
  payment: 'Thanh toán',
};
