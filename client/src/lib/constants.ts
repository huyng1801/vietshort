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

// Video Categories
export const CATEGORIES = [
  { slug: 'phim-bo', name: 'Phim Bộ', icon: 'Tv' },
  { slug: 'phim-le', name: 'Phim Lẻ', icon: 'Film' },
  { slug: 'tinh-cam', name: 'Tình Cảm', icon: 'Heart' },
  { slug: 'hanh-dong', name: 'Hành Động', icon: 'Sword' },
  { slug: 'kinh-di', name: 'Kinh Dị', icon: 'Ghost' },
  { slug: 'hai', name: 'Hài Hước', icon: 'Laugh' },
  { slug: 'hoat-hinh', name: 'Hoạt Hình', icon: 'Baby' },
  { slug: 'tam-ly', name: 'Tâm Lý', icon: 'Brain' },
  { slug: 'vien-tuong', name: 'Viễn Tưởng', icon: 'Rocket' },
  { slug: 'co-trang', name: 'Cổ Trang', icon: 'Crown' },
] as const;

// VIP Types
export const VIP_TYPES = {
  NORMAL: 'NORMAL',
  VIP_FREEADS: 'VIP_FREEADS',
  VIP_GOLD: 'VIP_GOLD',
} as const;

// VIP Packages - Matching README pricing exactly
export const VIP_PACKAGES = [
  {
    id: 'freeads-1m',
    type: 'VIP_FREEADS',
    name: 'VIP FreeAds - 1 Tháng',
    price: 19000,
    duration: 30,
    features: ['Xem không quảng cáo'],
  },
  {
    id: 'freeads-3m',
    type: 'VIP_FREEADS',
    name: 'VIP FreeAds - 3 Tháng',
    price: 49000,
    duration: 90,
    discount: 14,
    features: ['Xem không quảng cáo', 'Tiết kiệm 14%'],
  },
  {
    id: 'freeads-12m',
    type: 'VIP_FREEADS',
    name: 'VIP FreeAds - 1 Năm',
    price: 179000,
    duration: 365,
    discount: 22,
    features: ['Xem không quảng cáo', 'Tiết kiệm 22%'],
  },
  {
    id: 'gold-1m',
    type: 'VIP_GOLD',
    name: 'VIP Gold - 1 Tháng',
    price: 49000,
    duration: 30,
    features: ['Xem không quảng cáo', 'Chất lượng 1080p', 'Phim độc quyền'],
    recommended: true,
  },
  {
    id: 'gold-3m',
    type: 'VIP_GOLD',
    name: 'VIP Gold - 3 Tháng',
    price: 129000,
    duration: 90,
    discount: 12,
    features: ['Xem không quảng cáo', 'Chất lượng 1080p', 'Phim độc quyền'],
  },
  {
    id: 'gold-12m',
    type: 'VIP_GOLD',
    name: 'VIP Gold - 1 Năm',
    price: 469000,
    duration: 365,
    discount: 20,
    features: ['Xem không quảng cáo', 'Chất lượng 1080p', 'Phim độc quyền', 'Ưu đãi độc quyền'],
  },
] as const;

// Payment Methods
export const PAYMENT_METHODS = {
  MOMO: 'momo',
  VNPAY: 'vnpay',
  ZALOPAY: 'zalopay',
  BANK_TRANSFER: 'bank_transfer',
} as const;

// Video Status
export const VIDEO_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
} as const;

// Episode Status
export const EPISODE_STATUS = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  PURCHASE_VIP: 'PURCHASE_VIP',
  UNLOCK_EPISODE: 'UNLOCK_EPISODE',
  TRANSFER: 'TRANSFER',
  GIFT: 'GIFT',
  CTV_COMMISSION: 'CTV_COMMISSION',
  REFUND: 'REFUND',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Video Player
export const PLAYER_SETTINGS = {
  AUTO_PLAY: true,
  AUTO_NEXT_EPISODE: true,
  DEFAULT_QUALITY: '720p',
  DEFAULT_PLAYBACK_SPEED: 1.0,
  SKIP_INTRO_DURATION: 5,
  SKIP_OUTRO_DURATION: 10,
  PROGRESS_SAVE_INTERVAL: 5000, // ms
  SEEK_STEP: 10, // seconds
  VOLUME_STEP: 0.1,
} as const;

// Quality Options
export const VIDEO_QUALITIES = ['360p', '480p', '720p', '1080p', '1440p', '4K'] as const;

// Playback Speeds
export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

// Report Reasons
export const REPORT_REASONS = [
  { value: 'copyright', label: 'Vi phạm bản quyền' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'violence', label: 'Bạo lực' },
  { value: 'spam', label: 'Spam/Quảng cáo' },
  { value: 'other', label: 'Khác' },
] as const;

// Date Formats
export const DATE_FORMATS = {
  FULL: 'dd/MM/yyyy HH:mm:ss',
  DATE_ONLY: 'dd/MM/yyyy',
  TIME_ONLY: 'HH:mm',
  RELATIVE: 'relative',
} as const;

// Social Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/vietshort',
  YOUTUBE: 'https://youtube.com/vietshort',
  INSTAGRAM: 'https://instagram.com/vietshort',
  TIKTOK: 'https://tiktok.com/@vietshort',
} as const;

// Support
export const SUPPORT = {
  EMAIL: 'support@vietshort.vn',
  HOTLINE: '1900 1234',
  WORKING_HOURS: '08:00 - 22:00',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  SEARCH: '/search',
  WATCH: (id: string) => `/watch/${id}`,
  VIDEO_DETAIL: (id: string) => `/video/${id}`,
  CATEGORY: (slug: string) => `/category/${slug}`,
  PROFILE: '/account/profile',
  WALLET: '/account/wallet',
  VIP: '/account/vip',
  HISTORY: '/account/history',
  BOOKMARKS: '/account/bookmarks',
  SETTINGS: '/account/settings',
} as const;