// Database types (generated from Prisma)
export type VipType = 'VIP_FREEADS' | 'VIP_GOLD';
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'CONTENT_MANAGER';
export type VideoStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';
export type EncodingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type TransactionType = 'PURCHASE_GOLD' | 'PURCHASE_VIP' | 'SPEND_GOLD' | 'REFUND' | 'ADMIN_ADJUST' | 'EXCHANGE_REDEEM' | 'AD_REWARD' | 'CHECKIN_REWARD' | 'TASK_REWARD' | 'ACHIEVEMENT_REWARD';
export type PaymentProvider = 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'APPLE_IAP' | 'GOOGLE_PLAY' | 'ADMIN';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type UnlockMethod = 'GOLD' | 'AD' | 'VIP';
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
export type RewardType = 'GOLD' | 'VIP_DAYS' | 'BOTH';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type AgeRating = 'ALL' | 'T13' | 'T16' | 'T18';
export type DailyTaskType = 'WATCH_VIDEO' | 'LIKE_VIDEO' | 'COMMENT' | 'SHARE' | 'WATCH_AD' | 'RATE_VIDEO';
export type AchievementCondition = 'WATCH_EPISODES' | 'WATCH_MINUTES' | 'FIRST_COMMENT' | 'FIRST_LIKE' | 'FIRST_SHARE' | 'TOTAL_COMMENTS' | 'TOTAL_SHARES' | 'VIP_SUBSCRIBE' | 'GOLD_SPENT' | 'FOLLOW_SOCIAL' | 'STREAK_CHECKIN';
export type NotificationType = 'NEW_EPISODE' | 'PROMOTION' | 'SYSTEM' | 'VIP_EXPIRING' | 'ACHIEVEMENT' | 'REFERRAL' | 'PAYMENT' | 'REMINDER';
export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  nickname: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  vipTier?: VipType | null;
  vipExpiresAt?: string;
  goldBalance: number;
  isEmailVerified: boolean;
  isActive: boolean;
  isLocked: boolean;
  lockReason?: string;
  country?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Video types
export interface Video {
  id: string;
  title: string;
  description?: string;
  slug: string;
  poster?: string;
  duration?: number;
  releaseYear?: number;
  director?: string;
  actors?: string;
  country?: string;
  language: string;
  isSerial: boolean;
  totalEpisodes?: number;
  ageRating: AgeRating;
  genres?: string[];
  isVipOnly: boolean;
  vipTier?: VipType;
  unlockPrice?: number;
  status: VideoStatus;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  ratingAverage?: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  videoId: string;
  episodeNumber: number;
  title?: string;
  description?: string;
  hlsManifest?: string;
  mp4Url?: string;
  unlockPrice?: number;
  encodingStatus: EncodingStatus;
  encodingProgress: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// Admin types
export interface Admin {
  id: string;
  email: string;
  nickname: string;
  firstName?: string;
  lastName?: string;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  goldAmount?: number;
  vipDays?: number;
  provider?: PaymentProvider;
  providerTxId?: string;
  providerStatus?: string;
  referenceId?: string;
  description?: string;
  notes?: string;
  status: TransactionStatus;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// CTV (Affiliate) types
export interface CtvAffiliate {
  id: string;
  email: string;
  nickname: string;
  companyName?: string;
  realName: string;
  phone?: string;
  bankAccount?: string;
  bankName?: string;
  commissionRate: number;
  totalEarned: number;
  pendingPayout: number;
  paidOut: number;
  referralCode: string;
  referralUrl: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
  affiliate?: CtvAffiliate;
  user?: User;
}

// Exchange codes
export interface ExchangeCode {
  id: string;
  code: string;
  batchName: string;
  rewardType: RewardType;
  rewardValue: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

// Dashboard analytics
export interface DashboardStats {
  totalUsers: number;
  totalVideos: number;
  totalRevenue: number;
  totalViews: number;
  userGrowth: number;
  revenueGrowth: number;
  activeVipUsers: number;
  totalTransactions: number;
}

export interface AnalyticsData {
  date: string;
  users: number;
  views: number;
  revenue: number;
  registrations: number;
}

// Upload types
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

// Form types
export interface LoginFormData {
  login: string;
  password: string;
  remember?: boolean;
}

export interface VideoFormData {
  title: string;
  description?: string;
  director?: string;
  actors?: string;
  releaseYear?: number;
  country?: string;
  language: string;
  isSerial: boolean;
  totalEpisodes?: number;
  ageRating: AgeRating;
  genres: string[];
  isVipOnly: boolean;
  vipTier?: VipType;
  unlockPrice?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Filters
export interface UserFilters extends PaginationParams {
  vipTier?: VipType;
  isActive?: boolean;
  isLocked?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface VideoFilters extends PaginationParams {
  status?: VideoStatus;
  isVipOnly?: boolean;
  ageRating?: AgeRating;
  genres?: string[];
}

export interface TransactionFilters extends PaginationParams {
  type?: TransactionType;
  status?: TransactionStatus;
  provider?: PaymentProvider;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

// Socket events
export interface SocketEventMap {
  'encoding-progress': {
    episodeId: string;
    progress: number;
    status: EncodingStatus;
  };
  'encoding-complete': {
    episodeId: string;
    hlsManifest: string;
  };
  'encoding-error': {
    episodeId: string;
    error: string;
  };
  'admin-notification': {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    data?: any;
  };
}

// Configuration
export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  cdnUrl: string;
  maxFileSize: number;
  supportedVideoFormats: string[];
  supportedImageFormats: string[];
  defaultPageSize: number;
  maxPageSize: number;
}

// Error types
export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
  details?: any;
}

// Export utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};