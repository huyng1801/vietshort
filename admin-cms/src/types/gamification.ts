// ===== Gamification Types =====

export type DailyTaskType =
  | 'WATCH_VIDEO'
  | 'LIKE_VIDEO'
  | 'COMMENT'
  | 'SHARE'
  | 'WATCH_AD'
  | 'RATE_VIDEO';

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  type: DailyTaskType;
  targetValue: number;
  goldReward: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementCondition {
  type: 'WATCH_EPISODES' | 'WATCH_MINUTES' | 'FIRST_COMMENT' | 'FIRST_LIKE' | 'FIRST_SHARE' | 'TOTAL_COMMENTS' | 'TOTAL_SHARES' | 'VIP_SUBSCRIBE' | 'GOLD_SPENT' | 'FOLLOW_SOCIAL' | 'STREAK_CHECKIN';
  value: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  condition: AchievementCondition;
  conditionType?: string;
  conditionValue?: number;
  goldReward: number;
  sortOrder: number;
  isActive: boolean;
  _count?: { userAchievements: number };
  createdAt: string;
  updatedAt: string;
}

export interface CheckInReward {
  id: string;
  day: number;
  goldReward: number;
  bonusReward?: number;
  bonusDescription?: string;
  rewardGold?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GamificationOverview {
  dailyTasks: {
    total: number;
    active: number;
    activeTasks?: number;
    totalTasks?: number;
    todayCompletions?: number;
  };
  achievements: {
    total: number;
    active: number;
    totalUnlocked: number;
  };
  checkInRewards: { total: number; active: number };
  checkIns?: {
    todayCheckIns?: number;
    weekCheckIns?: number;
  };
}

// ===== Label Constants =====

export const DAILY_TASK_TYPE_LABELS: Record<DailyTaskType, string> = {
  WATCH_VIDEO: 'Xem video',
  LIKE_VIDEO: 'Thích video',
  COMMENT: 'Bình luận',
  SHARE: 'Chia sẻ',
  WATCH_AD: 'Xem quảng cáo',
  RATE_VIDEO: 'Đánh giá video',
};

export const ACHIEVEMENT_CONDITION_LABELS: Record<AchievementCondition['type'], string> = {
  WATCH_EPISODES: 'Xem đủ số tập',
  WATCH_MINUTES: 'Xem đủ số phút',
  FIRST_COMMENT: 'Bình luận đầu tiên',
  FIRST_LIKE: 'Thích đầu tiên',
  FIRST_SHARE: 'Chia sẻ đầu tiên',
  TOTAL_COMMENTS: 'Tổng số bình luận',
  TOTAL_SHARES: 'Tổng số chia sẻ',
  VIP_SUBSCRIBE: 'Đăng ký VIP',
  GOLD_SPENT: 'Tiêu vàng',
  FOLLOW_SOCIAL: 'Theo dõi mạng xã hội',
  STREAK_CHECKIN: 'Chuỗi điểm danh liên tục',
};

export const ACHIEVEMENT_CATEGORY_LABELS: Record<string, string> = {
  social: 'Tương tác xã hội',
  watch: 'Xem phim',
  payment: 'Thanh toán & VIP',
};
