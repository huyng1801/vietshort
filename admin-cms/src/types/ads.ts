// ===== Ads / AdMob Types =====
// Types aligned with Prisma schema: AdConfig, AdPlacement, AdPlacementType, AdPlatform, AdPlacementStatus

export type AdPlacementType = 'BANNER' | 'INTERSTITIAL' | 'REWARD_VIDEO' | 'NATIVE';

export type AdPlatform = 'ADMOB' | 'FACEBOOK' | 'UNITY' | 'CUSTOM';

export type AdPlacementStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

// Keep backward compat alias
export type AdStatus = AdPlacementStatus;

export interface AdPlacement {
  id: string;
  name: string;            // e.g. "Banner trang chủ", "Interstitial xem tập"
  type: AdPlacementType;
  platform: AdPlatform;
  adUnitId: string;         // AdMob unit ID (e.g. ca-app-pub-xxx/yyy)
  position: string;         // e.g. "home_top", "player_pre", "episode_unlock"
  description?: string;

  // Frequency controls
  frequency: number;         // Show every N minutes (0 = every time)
  maxPerSession: number;     // Max displays per session (0 = unlimited)
  maxPerDay: number;         // Max displays per day (0 = unlimited)
  cooldownSeconds: number;   // Cooldown between displays

  // Targeting — stored as comma-separated string in DB, parsed to array in API response
  targetPlatforms: string[]; // ['android', 'ios', 'web']
  excludeVip: boolean;       // Don't show to VIP users

  // Reward config (only for REWARD_VIDEO)
  rewardGold?: number;       // Gold reward for watching
  rewardMultiplier?: number; // Multiplier for gold (e.g. 2x)

  // Status
  isActive: boolean;
  status: AdPlacementStatus;
  priority: number;          // Higher = show first

  // Stats (read-only, denormalized)
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;              // Click-through rate %
  fillRate: number;         // Fill rate %

  createdAt: string;
  updatedAt: string;
}

export interface AdConfig {
  id?: string;
  
  // Global toggles
  adsEnabled: boolean;
  showAdsToGuest: boolean;
  showAdsToFree: boolean;
  showAdsToVipFreeads: boolean;  // Whether VIP FreeAds users see ads (should be false)
  showAdsToVipGold: boolean;     // Whether VIP Gold users see ads (should be false)

  // Global AdMob config
  admobAppIdAndroid: string;
  admobAppIdIos: string;

  // Test mode
  testMode: boolean;
  testDeviceIds: string[];  // Stored as JSON string in DB, parsed in API

  // Global frequency limits
  globalMaxAdsPerHour: number;
  globalMaxAdsPerDay: number;
  minIntervalBetweenAds: number; // seconds

  // Banner defaults
  bannerEnabled: boolean;
  bannerRefreshInterval: number; // seconds

  // Interstitial defaults
  interstitialEnabled: boolean;
  interstitialAfterEpisodes: number; // Show after every N episodes

  // Reward Video defaults
  rewardVideoEnabled: boolean;
  defaultRewardGold: number;
  maxRewardAdsPerDay: number;

  updatedAt?: string;
}

export interface AdRevenueStats {
  date: string;
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  fillRate: number;
  ecpm: number; // Effective cost per mille
}

export interface AdRevenueSummary {
  today: AdRevenueStats;
  yesterday: AdRevenueStats;
  thisWeek: { revenue: number; impressions: number; clicks: number };
  thisMonth: { revenue: number; impressions: number; clicks: number };
  byType: Record<AdPlacementType, { revenue: number; impressions: number }>;
  trend: AdRevenueStats[]; // Daily data for chart
}

export interface AdPlacementFormData {
  name: string;
  type: AdPlacementType;
  platform: AdPlatform;
  adUnitId: string;
  position: string;
  description?: string;
  frequency: number;
  maxPerSession: number;
  maxPerDay: number;
  cooldownSeconds: number;
  targetPlatforms: string[];
  excludeVip: boolean;
  rewardGold?: number;
  rewardMultiplier?: number;
  isActive: boolean;
  priority: number;
}
