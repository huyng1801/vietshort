// App Configuration
export const APP_NAME = 'VietShort';
export const APP_DESCRIPTION = 'Nền tảng xem phim ngắn trực tuyến hàng đầu Việt Nam';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vietshort.vn';

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'vietshort-auth',
  USER_PREFERENCES: 'vietshort-preferences',
  WATCH_HISTORY: 'vietshort-watch-history',
  RECENT_SEARCHES: 'vietshort-recent-searches',
  THEME: 'vietshort-theme',
  LANGUAGE: 'vietshort-language',
  PLAYER_SETTINGS: 'vietshort-player',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Video Player
export const PLAYER_SETTINGS = {
  AUTO_PLAY: true,
  AUTO_NEXT_EPISODE: true,
  DEFAULT_QUALITY: '540p',
  DEFAULT_PLAYBACK_SPEED: 1.0,
  SKIP_INTRO_DURATION: 5,
  SKIP_OUTRO_DURATION: 10,
  PROGRESS_SAVE_INTERVAL: 5000, // ms
  SEEK_STEP: 10, // seconds
  VOLUME_STEP: 0.1,
} as const;

// Playback Speeds
export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  SEARCH: '/search',
  WATCH: (id: string) => `/watch/${id}`,
  VIDEO_DETAIL: (id: string) => `/video/${id}`,
  CATEGORY: (slug: string) => `/search?category=${encodeURIComponent(slug)}`,
  PROFILE: '/profile',
  WALLET: '/wallet',
  VIP: '/vip',
  HISTORY: '/history',
  BOOKMARKS: '/bookmarks',
  SETTINGS: '/settings',
} as const;