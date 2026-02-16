import { PrismaClient, AdPlacementType, AdPlatform, AdPlacementStatus } from '@prisma/client';

export async function seedAds(prisma: PrismaClient) {
  console.log('📰 Creating Ads configuration & placements...');

  // ── 1) Global Ad Config (singleton row) ─────────────────
  await prisma.adConfig.deleteMany({});

  await prisma.adConfig.create({
    data: {
      adsEnabled: true,
      showAdsToGuest: true,
      showAdsToFree: true,
      showAdsToVipFreeads: false,
      showAdsToVipGold: false,
      admobAppIdAndroid: 'ca-app-pub-3940256099942544~3347511713', // Google test App ID
      admobAppIdIos: 'ca-app-pub-3940256099942544~1458002511',     // Google test App ID
      testMode: true,
      testDeviceIds: JSON.stringify(['EMULATOR', 'TEST_DEVICE_001']),
      globalMaxAdsPerHour: 6,
      globalMaxAdsPerDay: 30,
      minIntervalBetweenAds: 60,
      bannerEnabled: true,
      bannerRefreshInterval: 30,
      interstitialEnabled: true,
      interstitialAfterEpisodes: 3,
      rewardVideoEnabled: true,
      defaultRewardGold: 2,
      maxRewardAdsPerDay: 10,
    },
  });

  // ── 2) Ad Placements ────────────────────────────────────
  await prisma.adPlacement.deleteMany({});

  const placements = [
    // Banners
    {
      name: 'Banner Trang chủ - Trên cùng',
      type: AdPlacementType.BANNER,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/6300978111', // Google test Banner
      position: 'home_top',
      description: 'Banner hiển thị ở đầu trang chủ, phía dưới slider',
      frequency: 0,
      maxPerSession: 0,
      maxPerDay: 0,
      cooldownSeconds: 0,
      targetPlatforms: 'android,ios',
      excludeVip: true,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 10,
    },
    {
      name: 'Banner Trang chi tiết phim',
      type: AdPlacementType.BANNER,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/6300978111',
      position: 'video_detail',
      description: 'Banner ở trang chi tiết phim, dưới thông tin phim',
      frequency: 0,
      maxPerSession: 0,
      maxPerDay: 0,
      cooldownSeconds: 0,
      targetPlatforms: 'android,ios',
      excludeVip: true,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 8,
    },
    {
      name: 'Banner Danh sách tập',
      type: AdPlacementType.BANNER,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/6300978111',
      position: 'episode_list',
      description: 'Banner nhỏ giữa danh sách tập phim',
      frequency: 0,
      maxPerSession: 0,
      maxPerDay: 0,
      cooldownSeconds: 0,
      targetPlatforms: 'android,ios,web',
      excludeVip: true,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 5,
    },

    // Interstitials
    {
      name: 'Interstitial Sau khi xem tập',
      type: AdPlacementType.INTERSTITIAL,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/1033173712', // Google test Interstitial
      position: 'player_post',
      description: 'Quảng cáo toàn màn hình sau khi xem xong 1 tập',
      frequency: 5,
      maxPerSession: 3,
      maxPerDay: 10,
      cooldownSeconds: 120,
      targetPlatforms: 'android,ios',
      excludeVip: true,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 9,
    },
    {
      name: 'Interstitial Trang tìm kiếm',
      type: AdPlacementType.INTERSTITIAL,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/1033173712',
      position: 'search',
      description: 'Quảng cáo toàn màn hình khi mở trang tìm kiếm',
      frequency: 10,
      maxPerSession: 1,
      maxPerDay: 5,
      cooldownSeconds: 300,
      targetPlatforms: 'android,ios',
      excludeVip: true,
      isActive: false,
      status: AdPlacementStatus.PAUSED,
      priority: 3,
    },

    // Reward Videos
    {
      name: 'Reward Video Mở khóa tập',
      type: AdPlacementType.REWARD_VIDEO,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/5224354917', // Google test Reward
      position: 'episode_unlock',
      description: 'Xem quảng cáo để mở khóa tập phim thay vì trả vàng',
      frequency: 0,
      maxPerSession: 5,
      maxPerDay: 10,
      cooldownSeconds: 60,
      targetPlatforms: 'android,ios',
      excludeVip: true,
      rewardGold: 0, // No gold, unlock episode instead
      rewardMultiplier: 1,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 10,
    },
    {
      name: 'Reward Video Nhận vàng',
      type: AdPlacementType.REWARD_VIDEO,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/5224354917',
      position: 'daily_task_reward',
      description: 'Xem quảng cáo để nhận vàng - nhiệm vụ hàng ngày',
      frequency: 0,
      maxPerSession: 3,
      maxPerDay: 5,
      cooldownSeconds: 30,
      targetPlatforms: 'android,ios',
      excludeVip: false,
      rewardGold: 2,
      rewardMultiplier: 2,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 7,
    },
    {
      name: 'Reward Video Trang cá nhân',
      type: AdPlacementType.REWARD_VIDEO,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/5224354917',
      position: 'profile',
      description: 'Xem quảng cáo nhận vàng x2 từ trang cá nhân',
      frequency: 0,
      maxPerSession: 2,
      maxPerDay: 3,
      cooldownSeconds: 60,
      targetPlatforms: 'android,ios',
      excludeVip: false,
      rewardGold: 2,
      rewardMultiplier: 2,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 6,
    },

    // Native
    {
      name: 'Native Trong feed trang chủ',
      type: AdPlacementType.NATIVE,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/2247696110', // Google test Native
      position: 'home_feed',
      description: 'Quảng cáo tích hợp trong danh sách phim trang chủ',
      frequency: 0,
      maxPerSession: 2,
      maxPerDay: 8,
      cooldownSeconds: 0,
      targetPlatforms: 'android,ios',
      excludeVip: true,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 4,
    },
    {
      name: 'Native Trong feed nội dung',
      type: AdPlacementType.NATIVE,
      platform: AdPlatform.ADMOB,
      adUnitId: 'ca-app-pub-3940256099942544/2247696110',
      position: 'content_feed',
      description: 'Quảng cáo native xen kẽ trong feed nội dung/khám phá',
      frequency: 0,
      maxPerSession: 3,
      maxPerDay: 10,
      cooldownSeconds: 0,
      targetPlatforms: 'android,ios',
      excludeVip: true,
      isActive: true,
      status: AdPlacementStatus.ACTIVE,
      priority: 4,
    },
  ];

  for (const placement of placements) {
    await prisma.adPlacement.create({ data: placement });
  }

  console.log('✅ Ads configuration & 10 placements created\n');
}
