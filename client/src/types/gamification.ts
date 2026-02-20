// ─── Daily Check-in ──────────────────────────────────────────
export interface CheckInStatus {
  checkedInToday: boolean;
  currentStreak: number;
}

export interface CheckInRecord {
  id: string;
  userId: string;
  date: string;
  day: number;
  rewardGold: number;
  createdAt: string;
}

export interface CheckInResult {
  success: boolean;
  day?: number;
  goldReward?: number;
  message?: string;
}

/** Reward config for each day 1-7 */
export interface CheckInDayReward {
  day: number;
  gold: number;
  description: string;
}

/** Default 7-day reward cycle (matching backend hardcoded values) */
export const CHECK_IN_REWARDS: CheckInDayReward[] = [
  { day: 1, gold: 5, description: 'Ngày 1' },
  { day: 2, gold: 5, description: 'Ngày 2' },
  { day: 3, gold: 10, description: 'Ngày 3' },
  { day: 4, gold: 10, description: 'Ngày 4' },
  { day: 5, gold: 15, description: 'Ngày 5' },
  { day: 6, gold: 15, description: 'Ngày 6' },
  { day: 7, gold: 30, description: 'Tuần hoàn thành!' },
];

// ─── Daily Tasks / Quests ────────────────────────────────────
export type DailyTaskType =
  | 'WATCH_VIDEO'
  | 'LIKE_VIDEO'
  | 'COMMENT'
  | 'SHARE'
  | 'WATCH_AD'
  | 'RATE_VIDEO';

export interface DailyTaskStatus {
  id: string;
  name: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}

export interface WatchTrackResult {
  watchCount: number;
  goldEarned: number;
  milestones: number[];
  claimedMilestones: number[];
}

// ─── Achievements / Badges ───────────────────────────────────
export type AchievementCondition =
  | 'WATCH_EPISODES'
  | 'WATCH_MINUTES'
  | 'FIRST_COMMENT'
  | 'FIRST_LIKE'
  | 'FIRST_SHARE'
  | 'TOTAL_COMMENTS'
  | 'TOTAL_SHARES'
  | 'VIP_SUBSCRIBE'
  | 'GOLD_SPENT'
  | 'FOLLOW_SOCIAL'
  | 'STREAK_CHECKIN';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  claimed: boolean;
}

/** UI category grouping for achievements */
export type AchievementCategory = 'watch' | 'social' | 'payment' | 'streak';

/** Achievement display info for UI */
export interface AchievementDisplay extends Achievement {
  icon: string;
  category: AchievementCategory;
  color: string;
}

/** Map achievement IDs to UI display info */
export const ACHIEVEMENT_UI: Record<string, Omit<AchievementDisplay, keyof Achievement>> = {
  first_comment: { icon: '💬', category: 'social', color: 'blue' },
  first_share: { icon: '🔗', category: 'social', color: 'cyan' },
  first_rating: { icon: '⭐', category: 'social', color: 'yellow' },
  watch_10: { icon: '👀', category: 'watch', color: 'green' },
  watch_50: { icon: '🔥', category: 'watch', color: 'orange' },
  watch_100: { icon: '🏆', category: 'watch', color: 'amber' },
  streak_7: { icon: '📅', category: 'streak', color: 'purple' },
};

/** Default fallback for unknown achievements */
export const DEFAULT_ACHIEVEMENT_UI: Omit<AchievementDisplay, keyof Achievement> = {
  icon: '🎯',
  category: 'watch',
  color: 'gray',
};

/** Map task type to icon */
export const TASK_ICONS: Record<string, string> = {
  watch_3: '📺',
  watch_5: '🎬',
  watch_10: '🏅',
  WATCH_VIDEO: '📺',
  LIKE_VIDEO: '❤️',
  COMMENT: '💬',
  SHARE: '🔗',
  WATCH_AD: '📺',
  RATE_VIDEO: '⭐',
};
