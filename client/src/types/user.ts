export type VipType = 'VIP_FREEADS' | 'VIP_GOLD';

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  birthYear?: number;
  vipTier?: VipType | null;
  vipExpiresAt?: string | null;
  goldBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  watchHistory?: WatchHistoryItem[];
  bookmarks?: string[];
  favorites?: string[];
}

export interface WatchHistoryItem {
  videoId: string;
  episodeId: string;
  progress: number;
  duration: number;
  watchedAt: string;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  autoPlay: boolean;
  autoNextEpisode: boolean;
  defaultQuality: string;
  defaultPlaybackSpeed: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
}