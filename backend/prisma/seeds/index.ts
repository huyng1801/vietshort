import { 
  PrismaClient, 
  AdminRole,
  VipType,
  DailyTaskType,
  AchievementCondition,
  RewardType
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding for VietShort - Chinese Short Drama Platform...\n');

  // ═══════════════════════════════════════════════════════════
  // 1. ADMIN ACCOUNTS
  // ═══════════════════════════════════════════════════════════
  console.log('👥 Creating admin accounts...');

  const superAdminPassword = await bcrypt.hash('superadmin123', 12);
  await prisma.admin.upsert({
    where: { email: 'superadmin@vietshort.com' },
    update: {},
    create: {
      email: 'superadmin@vietshort.com',
      nickname: 'SuperAdmin',
      passwordHash: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: AdminRole.SUPER_ADMIN,
      permissions: JSON.stringify(['*']),
      isActive: true,
    },
  });

  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@vietshort.com' },
    update: {},
    create: {
      email: 'admin@vietshort.com',
      nickname: 'Admin',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: AdminRole.ADMIN,
      permissions: JSON.stringify(['user_management', 'content_management', 'analytics']),
      isActive: true,
    },
  });

  const contentManagerPassword = await bcrypt.hash('content123', 12);
  await prisma.admin.upsert({
    where: { email: 'content@vietshort.com' },
    update: {},
    create: {
      email: 'content@vietshort.com',
      nickname: 'ContentManager',
      passwordHash: contentManagerPassword,
      firstName: 'Content',
      lastName: 'Manager',
      role: AdminRole.CONTENT_MANAGER,
      permissions: JSON.stringify(['content_management', 'video_review']),
      isActive: true,
    },
  });

  const moderatorPassword = await bcrypt.hash('mod123', 12);
  await prisma.admin.upsert({
    where: { email: 'moderator@vietshort.com' },
    update: {},
    create: {
      email: 'moderator@vietshort.com',
      nickname: 'Moderator',
      passwordHash: moderatorPassword,
      firstName: 'Moderator',
      lastName: 'User',
      role: AdminRole.MODERATOR,
      permissions: JSON.stringify(['user_moderation', 'comment_moderation']),
      isActive: true,
    },
  });

  console.log('✅ Admin accounts created\n');

  // ═══════════════════════════════════════════════════════════
  // 2. GENRES - Detailed Genre Tags
  // ═══════════════════════════════════════════════════════════
  console.log('🏷️  Creating genre tags...');

  const genres = [
    { name: 'Tu Tiên', slug: 'tu-tien', description: 'Tu luyện thành tiên', sortOrder: 1 },
    { name: 'Tu Ma', slug: 'tu-ma', description: 'Tu luyện ma công', sortOrder: 2 },
    { name: 'Hệ Thống', slug: 'he-thong', description: 'Có hệ thống hỗ trợ', sortOrder: 3 },
    { name: 'Tái Sinh', slug: 'tai-sinh', description: 'Được tái sinh, sống lại', sortOrder: 4 },
    { name: 'Ngược Tập', slug: 'nguoc-tap', description: 'Phản công, ngược tập', sortOrder: 5 },
    { name: 'Ngọt Sủng', slug: 'ngot-sung', description: 'Ngọt ngào, sủng chiều', sortOrder: 6 },
    { name: 'Gia Đấu', slug: 'gia-dau', description: 'Đấu đá gia tộc', sortOrder: 7 },
    { name: 'Cung Đấu', slug: 'cung-dau', description: 'Đấu đá hậu cung', sortOrder: 8 },
    { name: 'Hào Môn Ân Oán', slug: 'hao-mon-an-oan', description: 'Ân oán hào môn', sortOrder: 9 },
    { name: 'Tổng Tài Sủng Vợ', slug: 'tong-tai-sung-vo', description: 'Tổng tài chiều vợ', sortOrder: 10 },
    { name: 'Nữ Cường', slug: 'nu-cuong', description: 'Nữ chủ mạnh mẽ', sortOrder: 11 },
    { name: 'Nam Cường', slug: 'nam-cuong', description: 'Nam chủ quyền lực', sortOrder: 12 },
    { name: 'Phế Vật Ngược Tập', slug: 'phe-vat-nguoc-tap', description: 'Từ phế vật đến thiên tài', sortOrder: 13 },
    { name: 'Y Thuật', slug: 'y-thuat', description: 'Y học, chữa bệnh', sortOrder: 14 },
    { name: 'Không Gian', slug: 'khong-gian', description: 'Có không gian riêng', sortOrder: 15 },
    { name: 'Linh Thú', slug: 'linh-thu', description: 'Có thú cưng linh vật', sortOrder: 16 },
    { name: 'Hỏa Táng', slug: 'hoa-tang', description: 'Hot, trending, viral', sortOrder: 17 },
    { name: 'Đam Mỹ', slug: 'dam-my', description: 'Boy love', sortOrder: 18 },
    { name: 'Bách Hợp', slug: 'bach-hop', description: 'Girl love', sortOrder: 19 },
    { name: 'Xuyên Nhanh', slug: 'xuyen-nhanh', description: 'Xuyên qua nhiều thế giới', sortOrder: 20 },
  ];

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: genre,
      create: genre,
    });
  }

  console.log('✅ Genres created\n');

  // ═══════════════════════════════════════════════════════════
  // 4. VIP PLANS - As per README requirements
  // ═══════════════════════════════════════════════════════════
  console.log('💎 Creating VIP plans...');

  // Delete existing VIP plans first to avoid duplicates
  await prisma.vipPlan.deleteMany({});

  const vipPlans = [
    // VIP FreeAds Plans
    {
      name: 'VIP FreeAds - 1 Tháng',
      vipType: VipType.VIP_FREEADS,
      durationDays: 30,
      priceVnd: 19000,
      priceGold: 1900,
      discount: null,
      description: 'Xem phim không quảng cáo trong 1 tháng',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'VIP FreeAds - 3 Tháng',
      vipType: VipType.VIP_FREEADS,
      durationDays: 90,
      priceVnd: 49000,
      priceGold: 4900,
      discount: 0.14, // Tiết kiệm 14%
      description: 'Xem phim không quảng cáo trong 3 tháng - Tiết kiệm 14%',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'VIP FreeAds - 1 Năm',
      vipType: VipType.VIP_FREEADS,
      durationDays: 365,
      priceVnd: 179000,
      priceGold: 17900,
      discount: 0.22, // Tiết kiệm 22%
      description: 'Xem phim không quảng cáo trong 1 năm - Tiết kiệm 22%',
      isActive: true,
      sortOrder: 3,
    },
    // VIP Gold Plans
    {
      name: 'VIP Gold - 1 Tháng',
      vipType: VipType.VIP_GOLD,
      durationDays: 30,
      priceVnd: 49000,
      priceGold: 4900,
      discount: null,
      description: 'Không quảng cáo + 1080p + Phim độc quyền + Hỗ trợ ưu tiên',
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'VIP Gold - 3 Tháng',
      vipType: VipType.VIP_GOLD,
      durationDays: 90,
      priceVnd: 129000,
      priceGold: 12900,
      discount: 0.12, // Tiết kiệm 12%
      description: 'Không quảng cáo + 1080p + Phim độc quyền + Hỗ trợ ưu tiên - Tiết kiệm 12%',
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'VIP Gold - 1 Năm',
      vipType: VipType.VIP_GOLD,
      durationDays: 365,
      priceVnd: 469000,
      priceGold: 46900,
      discount: 0.20, // Tiết kiệm 20%
      description: 'Không quảng cáo + 1080p + Phim độc quyền + Hỗ trợ ưu tiên - Tiết kiệm 20%',
      isActive: true,
      sortOrder: 6,
    },
  ];

  for (const plan of vipPlans) {
    await prisma.vipPlan.create({
      data: plan,
    });
  }

  console.log('✅ VIP plans created\n');

  // ═══════════════════════════════════════════════════════════
  // 5. DAILY TASKS - Gamification
  // ═══════════════════════════════════════════════════════════
  console.log('🎯 Creating daily tasks...');

  // Delete existing daily tasks
  await prisma.dailyTask.deleteMany({});

  const dailyTasks = [
    {
      name: 'Xem 1 tập phim',
      description: 'Xem ít nhất 1 tập phim bất kỳ',
      taskType: DailyTaskType.WATCH_VIDEO,
      targetCount: 1,
      rewardGold: 10,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Xem 3 tập phim',
      description: 'Xem ít nhất 3 tập phim trong ngày',
      taskType: DailyTaskType.WATCH_VIDEO,
      targetCount: 3,
      rewardGold: 30,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Thích 1 video',
      description: 'Thích ít nhất 1 video',
      taskType: DailyTaskType.LIKE_VIDEO,
      targetCount: 1,
      rewardGold: 5,
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Bình luận 1 lần',
      description: 'Để lại bình luận cho bất kỳ phim nào',
      taskType: DailyTaskType.COMMENT,
      targetCount: 1,
      rewardGold: 15,
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'Chia sẻ phim',
      description: 'Chia sẻ phim lên mạng xã hội',
      taskType: DailyTaskType.SHARE,
      targetCount: 1,
      rewardGold: 20,
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'Xem quảng cáo',
      description: 'Xem quảng cáo để nhận thưởng 2x vàng',
      taskType: DailyTaskType.WATCH_AD,
      targetCount: 1,
      rewardGold: 40,
      isActive: true,
      sortOrder: 6,
    },
    {
      name: 'Đánh giá phim',
      description: 'Đánh giá 1 phim (chỉ VIP)',
      taskType: DailyTaskType.RATE_VIDEO,
      targetCount: 1,
      rewardGold: 25,
      isActive: true,
      sortOrder: 7,
    }
  ];

  for (const task of dailyTasks) {
    await prisma.dailyTask.create({
      data: task,
    });
  }

  console.log('✅ Daily tasks created\n');

  // ═══════════════════════════════════════════════════════════
  // 5.1 CHECK-IN REWARDS - Configuration
  // ═══════════════════════════════════════════════════════════
  console.log('📅 Creating check-in reward configuration...');

  // Delete existing check-in rewards
  await prisma.checkInReward.deleteMany({});

  const checkInRewards = [
    {
      day: 1,
      rewardGold: 10,
      description: 'Điểm danh ngày đầu tiên',
      isActive: true,
      sortOrder: 1,
    },
    {
      day: 2,
      rewardGold: 15,
      description: 'Điểm danh ngày thứ 2',
      isActive: true,
      sortOrder: 2,
    },
    {
      day: 3,
      rewardGold: 20,
      description: 'Điểm danh ngày thứ 3',
      isActive: true,
      sortOrder: 3,
    },
    {
      day: 4,
      rewardGold: 25,
      description: 'Điểm danh ngày thứ 4',
      isActive: true,
      sortOrder: 4,
    },
    {
      day: 5,
      rewardGold: 30,
      description: 'Điểm danh ngày thứ 5',
      isActive: true,
      sortOrder: 5,
    },
    {
      day: 6,
      rewardGold: 40,
      description: 'Điểm danh ngày thứ 6',
      isActive: true,
      sortOrder: 6,
    },
    {
      day: 7,
      rewardGold: 50,
      description: 'Điểm danh tuần đầy đủ - Thưởng lớn!',
      isActive: true,
      sortOrder: 7,
    },
  ];

  for (const reward of checkInRewards) {
    await prisma.checkInReward.create({
      data: reward,
    });
  }

  console.log('✅ Check-in rewards created\n');

  // ═══════════════════════════════════════════════════════════
  // 6. ACHIEVEMENTS - User Milestones
  // ═══════════════════════════════════════════════════════════
  console.log('🏆 Creating achievements...');

  // Delete existing achievements
  await prisma.achievement.deleteMany({});

  const achievements = [
    {
      name: 'Bình luận đầu tiên',
      description: 'Để lại bình luận đầu tiên của bạn',
      icon: '💬',
      category: 'social',
      conditionType: AchievementCondition.FIRST_COMMENT,
      conditionValue: 1,
      rewardGold: 50,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Thích đầu tiên',
      description: 'Thích video đầu tiên',
      icon: '❤️',
      category: 'social',
      conditionType: AchievementCondition.FIRST_LIKE,
      conditionValue: 1,
      rewardGold: 30,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Chia sẻ đầu tiên',
      description: 'Chia sẻ phim đầu tiên lên mạng xã hội',
      icon: '🚀',
      category: 'social',
      conditionType: AchievementCondition.FIRST_SHARE,
      conditionValue: 1,
      rewardGold: 40,
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Người xem tích cực',
      description: 'Xem 10 tập phim',
      icon: '📺',
      category: 'watch',
      conditionType: AchievementCondition.WATCH_EPISODES,
      conditionValue: 10,
      rewardGold: 100,
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'Người xem cuồng nhiệt',
      description: 'Xem 50 tập phim',
      icon: '🔥',
      category: 'watch',
      conditionType: AchievementCondition.WATCH_EPISODES,
      conditionValue: 50,
      rewardGold: 500,
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'Người xem chuyên nghiệp',
      description: 'Xem 100 tập phim',
      icon: '⭐',
      category: 'watch',
      conditionType: AchievementCondition.WATCH_EPISODES,
      conditionValue: 100,
      rewardGold: 1000,
      isActive: true,
      sortOrder: 6,
    },
    {
      name: 'Xem phim Marathon',
      description: 'Xem phim tổng cộng 1000 phút',
      icon: '⏰',
      category: 'watch',
      conditionType: AchievementCondition.WATCH_MINUTES,
      conditionValue: 1000,
      rewardGold: 800,
      isActive: true,
      sortOrder: 7,
    },
    {
      name: 'Người bình luận tích cực',
      description: 'Để lại 10 bình luận',
      icon: '💭',
      category: 'social',
      conditionType: AchievementCondition.TOTAL_COMMENTS,
      conditionValue: 10,
      rewardGold: 200,
      isActive: true,
      sortOrder: 8,
    },
    {
      name: 'Người chia sẻ nhiệt tình',
      description: 'Chia sẻ phim 5 lần',
      icon: '🎁',
      category: 'social',
      conditionType: AchievementCondition.TOTAL_SHARES,
      conditionValue: 5,
      rewardGold: 150,
      isActive: true,
      sortOrder: 9,
    },
    {
      name: 'Thành viên VIP',
      description: 'Đăng ký gói VIP lần đầu',
      icon: '👑',
      category: 'payment',
      conditionType: AchievementCondition.VIP_SUBSCRIBE,
      conditionValue: 1,
      rewardGold: 300,
      isActive: true,
      sortOrder: 10,
    },
    {
      name: 'Người chi tiêu',
      description: 'Tiêu 500 vàng',
      icon: '💰',
      category: 'payment',
      conditionType: AchievementCondition.GOLD_SPENT,
      conditionValue: 500,
      rewardGold: 100,
      isActive: true,
      sortOrder: 11,
    },
    {
      name: 'Fan trung thành',
      description: 'Điểm danh liên tục 7 ngày',
      icon: '📅',
      category: 'watch',
      conditionType: AchievementCondition.STREAK_CHECKIN,
      conditionValue: 7,
      rewardGold: 250,
      isActive: true,
      sortOrder: 12,
    },
    {
      name: 'Theo dõi mạng xã hội',
      description: 'Theo dõi fanpage Facebook/TikTok',
      icon: '👥',
      category: 'social',
      conditionType: AchievementCondition.FOLLOW_SOCIAL,
      conditionValue: 1,
      rewardGold: 100,
      isActive: true,
      sortOrder: 13,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    });
  }

  console.log('✅ Achievements created\n');

  // ═══════════════════════════════════════════════════════════
  // 7. BANNERS - Promotional Banners
  // Delete existing banners
  await prisma.banner.deleteMany({});

  // ═══════════════════════════════════════════════════════════
  console.log('🎭 Creating promotional banners...');

  const banners = [
    {
      title: 'Chào mừng đến VietShort',
      imageUrl: '/banners/welcome-banner.jpg',
      linkUrl: null,
      linkType: null,
      linkTarget: null,
      sortOrder: 1,
      isActive: true,
      startAt: new Date(),
      endAt: null,
      targetVipType: null,
    },
    {
      title: 'Khuyến mãi VIP Gold - Giảm 20%',
      imageUrl: '/banners/vip-gold-promo.jpg',
      linkUrl: '/vip',
      linkType: 'promotion',
      linkTarget: 'vip-gold',
      sortOrder: 2,
      isActive: true,
      startAt: new Date(),
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      targetVipType: VipType.NORMAL,
    },
    {
      title: 'Phim mới cập nhật hàng ngày',
      imageUrl: '/banners/new-releases.jpg',
      linkUrl: '/movies/new',
      linkType: 'external',
      linkTarget: null,
      sortOrder: 3,
      isActive: true,
      startAt: new Date(),
      endAt: null,
      targetVipType: null,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({
      data: banner,
    });
  }

  console.log('✅ Banners created\n');

  // ═══════════════════════════════════════════════════════════
  // 8. CTV AFFILIATES - Sample Partner Accounts
  // ═══════════════════════════════════════════════════════════
  console.log('🤝 Creating CTV affiliate accounts...');

  const ctvPassword = await bcrypt.hash('ctv123456', 12);
  
  const ctvAffiliates = [
    {
      email: 'partner1@example.com',
      nickname: 'Partner1',
      passwordHash: ctvPassword,
      companyName: 'Media Marketing Co.',
      realName: 'Nguyễn Văn A',
      phone: '0901234567',
      bankAccount: '1234567890',
      bankName: 'Vietcombank',
      commissionRate: 0.15, // 15%
      referralCode: 'CTV001',
      referralUrl: 'https://vietshort.vn/?ref=CTV001',
      isActive: true,
      isVerified: true,
    },
    {
      email: 'partner2@example.com',
      nickname: 'Partner2',
      passwordHash: ctvPassword,
      companyName: 'Digital Ads Agency',
      realName: 'Trần Thị B',
      phone: '0907654321',
      bankAccount: '0987654321',
      bankName: 'Techcombank',
      commissionRate: 0.12, // 12%
      referralCode: 'CTV002',
      referralUrl: 'https://vietshort.vn/?ref=CTV002',
      isActive: true,
      isVerified: true,
    },
    {
      email: 'partner3@example.com',
      nickname: 'Partner3',
      passwordHash: ctvPassword,
      companyName: 'Social Influencer',
      realName: 'Lê Văn C',
      phone: '0903456789',
      bankAccount: '1122334455',
      bankName: 'ACB',
      commissionRate: 0.10, // 10%
      referralCode: 'CTV003',
      referralUrl: 'https://vietshort.vn/?ref=CTV003',
      isActive: true,
      isVerified: true,
    },
  ];

  for (const ctv of ctvAffiliates) {
    await prisma.ctvAffiliate.upsert({
      where: { email: ctv.email },
      update: ctv,
      create: ctv,
    });
  }

  console.log('✅ CTV affiliates created\n');

  // ═══════════════════════════════════════════════════════════
  // 9. EXCHANGE CODES - Sample Codes
  // ═══════════════════════════════════════════════════════════
  console.log('🎟️  Creating exchange codes...');

  const exchangeCodes = [
    // Welcome pack
    {
      code: 'WELCOME100',
      batchName: 'Welcome Pack 2024',
      description: 'Mã chào mừng người dùng mới - 100 vàng',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 10,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      createdBy: 'superadmin@vietshort.com',
    },
    // VIP trial
    {
      code: 'VIP7DAYS',
      batchName: 'VIP Trial Pack',
      description: 'Dùng thử VIP Gold 7 ngày miễn phí',
      rewardType: RewardType.VIP_DAYS,
      rewardValue: 7,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 8,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      createdBy: 'superadmin@vietshort.com',
    },
    // Combo pack
    {
      code: 'COMBO500',
      batchName: 'Combo Pack Special',
      description: '500 vàng + VIP Gold 3 ngày',
      rewardType: RewardType.BOTH,
      rewardValue: 500, // Gold amount
      usageLimit: 1,
      usedCount: 0,
      codeLength: 8,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdBy: 'superadmin@vietshort.com',
    },
    // Event codes
    {
      code: 'NEWYEAR2024',
      batchName: 'Tết 2024 Event',
      description: 'Mã Tết 2024 - 200 vàng',
      rewardType: RewardType.GOLD,
      rewardValue: 200,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date('2024-12-31'),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'BLACKFRIDAY',
      batchName: 'Black Friday 2024',
      description: 'Black Friday - VIP Gold 30 ngày',
      rewardType: RewardType.VIP_DAYS,
      rewardValue: 30,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date('2024-11-30'),
      createdBy: 'superadmin@vietshort.com',
    },
  ];

  for (const code of exchangeCodes) {
    await prisma.exchangeCode.upsert({
      where: { code: code.code },
      update: code,
      create: code,
    });
  }

  console.log('✅ Exchange codes created\n');

  // ═══════════════════════════════════════════════════════════
  // 10. TEST USERS - Sample User Accounts
  // ═══════════════════════════════════════════════════════════
  console.log('👤 Creating test user accounts...');

  const testUserPassword = await bcrypt.hash('user123456', 12);

  const testUsers = [
    {
      email: 'user1@test.com',
      nickname: 'TestUser1',
      passwordHash: testUserPassword,
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      vipType: VipType.NORMAL,
      goldBalance: 500,
      isEmailVerified: true,
      isActive: true,
      registrationSource: 'web',
      language: 'vi',
    },
    {
      email: 'user2@test.com',
      nickname: 'TestUser2',
      passwordHash: testUserPassword,
      firstName: 'Trần',
      lastName: 'Thị B',
      vipType: VipType.VIP_FREEADS,
      vipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      goldBalance: 1000,
      isEmailVerified: true,
      isActive: true,
      registrationSource: 'web',
      language: 'vi',
    },
    {
      email: 'user3@test.com',
      nickname: 'TestUser3',
      passwordHash: testUserPassword,
      firstName: 'Lê',
      lastName: 'Văn C',
      vipType: VipType.VIP_GOLD,
      vipExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      goldBalance: 2000,
      isEmailVerified: true,
      isActive: true,
      registrationSource: 'android',
      language: 'vi',
    },
  ];

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log('✅ Test users created\n');

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✨ SEEDING COMPLETED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📋 ADMIN LOGIN CREDENTIALS:');
  console.log('┌─────────────────────┬───────────────────────────┬───────────────┐');
  console.log('│ Role                │ Email                     │ Password      │');
  console.log('├─────────────────────┼───────────────────────────┼───────────────┤');
  console.log('│ SUPER_ADMIN         │ superadmin@vietshort.com  │ superadmin123 │');
  console.log('│ ADMIN               │ admin@vietshort.com       │ admin123      │');
  console.log('│ CONTENT_MANAGER     │ content@vietshort.com     │ content123    │');
  console.log('│ MODERATOR           │ moderator@vietshort.com   │ mod123        │');
  console.log('└─────────────────────┴───────────────────────────┴───────────────┘');
  console.log('');
  console.log('🤝 CTV AFFILIATE LOGIN:');
  console.log('┌───────────────────────┬──────────┬────────────┐');
  console.log('│ Email                 │ Password │ Ref Code   │');
  console.log('├───────────────────────┼──────────┼────────────┤');
  console.log('│ partner1@example.com  │ ctv123456│ CTV001     │');
  console.log('│ partner2@example.com  │ ctv123456│ CTV002     │');
  console.log('│ partner3@example.com  │ ctv123456│ CTV003     │');
  console.log('└───────────────────────┴──────────┴────────────┘');
  console.log('');
  console.log('👤 TEST USER ACCOUNTS:');
  console.log('┌────────────────────┬──────────┬──────────────┬─────────┐');
  console.log('│ Email              │ Password │ VIP Type     │ Gold    │');
  console.log('├────────────────────┼──────────┼──────────────┼─────────┤');
  console.log('│ user1@test.com     │ user123456│ NORMAL      │ 500     │');
  console.log('│ user2@test.com     │ user123456│ VIP_FREEADS │ 1000    │');
  console.log('│ user3@test.com     │ user123456│ VIP_GOLD    │ 2000    │');
  console.log('└────────────────────┴──────────┴──────────────┴─────────┘');
  console.log('');
  console.log('🎟️  EXCHANGE CODES:');
  console.log('┌──────────────┬─────────────────────────────────────┐');
  console.log('│ Code         │ Reward                               │');
  console.log('├──────────────┼─────────────────────────────────────┤');
  console.log('│ WELCOME100   │ 100 Gold                            │');
  console.log('│ VIP7DAYS     │ VIP Gold 7 days                     │');
  console.log('│ COMBO500     │ 500 Gold + VIP Gold 3 days          │');
  console.log('│ NEWYEAR2024  │ 200 Gold                            │');
  console.log('│ BLACKFRIDAY  │ VIP Gold 30 days                    │');
  console.log('└──────────────┴─────────────────────────────────────┘');
  console.log('');
  console.log('📊 DATA SEEDED:');
  console.log('  ✓ 20 Genre Tags (Tu Tiên, Hệ Thống, Ngược Tập...)');
  console.log('  ✓ 6 VIP Plans (FreeAds & Gold)');
  console.log('  ✓ 8 Daily Tasks');
  console.log('  ✓ 7 Check-in Reward Configurations');
  console.log('  ✓ 13 Achievements');
  console.log('  ✓ 3 Promotional Banners');
  console.log('  ✓ 3 CTV Affiliate Accounts');
  console.log('  ✓ 5 Exchange Codes');
  console.log('  ✓ 3 Test User Accounts');
  console.log('  ✓ 4 Admin Accounts');
  console.log('');
  console.log('⚠️  IMPORTANT NOTES:');
  console.log('  • Videos NOT seeded - Add manually via Admin CMS after uploading to R2');
  console.log('  • Remember to update banner image URLs to actual R2 paths');
  console.log('  • Change default passwords before production deployment');
  console.log('  • Configure payment gateways (VNPay, Momo) in .env');
  console.log('  • Set up Cloudflare R2 for video storage');
  console.log('');
  console.log('🎬 NEXT STEPS:');
  console.log('  1. Upload videos to Cloudflare R2');
  console.log('  2. Add videos via Admin CMS (content@vietshort.com)');
  console.log('  3. Configure payment providers');
  console.log('  4. Set up Firebase for push notifications');
  console.log('  5. Test complete user flow');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });