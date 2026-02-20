// ===== User & Wallet Types =====

import type { PaginationInfo } from './common';

export type VipType = 'VIP_GOLD' | 'VIP_FREEADS' | null;
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type TransactionType =
  | 'PURCHASE_GOLD'
  | 'PURCHASE_VIP'
  | 'SPEND_GOLD'
  | 'REFUND'
  | 'ADMIN_ADJUST'
  | 'EXCHANGE_REDEEM'
  | 'AD_REWARD'
  | 'CHECKIN_REWARD'
  | 'TASK_REWARD'
  | 'ACHIEVEMENT_REWARD';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type UnlockMethod = 'GOLD' | 'VIP' | 'PROMO_CODE' | 'AD';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
  birthday?: string;
  avatar?: string;
  isActive: boolean;
  role: string;
  vipType: VipType;
  vipExpiry?: string;
  goldBalance: number;
  totalSpent: number;
  referralCode?: string;
  referredBy?: string;
  lastLoginAt?: string;
  loginCount: number;
  watchCount: number;
  checkInStreak: number;
  totalCheckIns: number;
  _count?: {
    unlockedEpisodes: number;
    watchHistory: number;
    favorites: number;
    comments: number;
    transactions: number;
  };
  nickname?: string;
  isLocked?: boolean;
  isEmailVerified?: boolean;
  vipTier?: string;
  vipExpiresAt?: string;
  registrationSource?: string;
  deviceId?: string;
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  tiktokId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  goldAmount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  description?: string;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  user?: { id: string; email: string; firstName?: string; lastName?: string };
  createdAt: string;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  episodeId: string;
  progress: number;
  duration: number;
  completedAt?: string;
  episode: {
    id: string;
    episodeNumber: number;
    title?: string;
    video: { id: string; title: string; poster?: string };
  };
  video?: { id: string; title: string; poster?: string; };
  createdAt: string;
  updatedAt: string;
}

export interface UnlockHistoryItem {
  id: string;
  userId: string;
  episodeId: string;
  method: UnlockMethod;
  goldSpent: number;
  episode: {
    id: string;
    episodeNumber: number;
    title?: string;
    video: { id: string; title: string; poster?: string };
  };
  createdAt: string;
}

export interface CheckInItem {
  id: string;
  userId: string;
  day: number;
  goldReward: number;
  bonusReward?: number;
  streakDay: number;
  rewardGold?: number;
  createdAt: string;
}

export interface UserEngagementStats {
  totalWatchTime: number;
  videosWatched: number;
  episodesUnlocked: number;
  commentsPosted: number;
  ratingsGiven: number;
  favoritesCount: number;
  sharesCount: number;
  avgSessionDuration: number;
  lastActiveAt?: string;
  watch?: {
    totalTime: number;
    videosWatched: number;
    avgSessionDuration: number;
    episodesCompleted?: number;
    totalWatchTime?: number;
    totalWatchCount?: number;
    completedCount?: number;
  };
  unlock?: {
    totalUnlocked: number;
    goldSpent?: number;
    vipUnlocks?: number;
    totalUnlocks?: number;
    goldSpentOnUnlocks?: number;
    adUnlocks?: number;
  };
  checkIn?: {
    streak: number;
    total: number;
    lastCheckIn?: string;
    totalCheckIns?: number;
    totalCheckInGold?: number;
  };
  social?: {
    comments: number;
    ratings: number;
    favorites: number;
    shares: number;
    totalFavorites?: number;
    totalLikes?: number;
    totalComments?: number;
    totalRatings?: number;
  };
  financial?: {
    goldEarned: number;
    goldSpent: number;
    totalPurchased?: number;
    totalTransactions?: number;
    totalSpent?: number;
  };
  achievements?: {
    total: number;
    completed?: number;
  };
}

export interface UserReferralData {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  referrals: UserReferralItem[];
  pagination: PaginationInfo;
}

export interface UserReferralItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  joinedAt: string;
  isActive: boolean;
  totalSpent: number;
  user?: { email: string; firstName?: string; lastName?: string; avatar?: string; nickname?: string; vipTier?: string; isActive?: boolean; };
  totalRevenue?: number;
  totalCommission?: number;
}

export interface AuditLogItem {
  id: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  performedBy?: { id: string; email: string; firstName?: string };
  admin?: { id: string; email: string; firstName?: string; lastName?: string; };
  resource?: string;
  resourceId?: string;
  createdAt: string;
}

export interface UserAchievementItem {
  id: string;
  achievementId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    goldReward: number;
    condition: string;
    targetValue: number;
    category?: string;
    rewardGold?: number;
  };
  createdAt: string;
}

export interface UserDailyTaskItem {
  id: string;
  taskId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  currentCount?: number;
  task: {
    id: string;
    name: string;
    description: string;
    type: string;
    targetValue: number;
    goldReward: number;
    targetCount?: number;
    rewardGold?: number;
  };
  assignedDate: string;
  createdAt: string;
}

// ===== VIP Plans =====

export interface VipPlan {
  id: string;
  name: string;
  vipType: 'VIP_FREEADS' | 'VIP_GOLD';
  durationDays: number;
  priceVnd: number;
  discount: number | null;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ===== Gold Packages =====

export interface GoldPackage {
  id: string;
  name: string;
  goldAmount: number;
  bonusGold: number;
  priceVnd: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
