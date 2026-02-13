import { 
  PrismaClient, 
  AdminRole,
  VipType,
  DailyTaskType,
  AchievementCondition,
  RewardType,
  PayoutStatus
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
  // 3. VIP PLANS - As per README requirements
  // ═══════════════════════════════════════════════════════════
  console.log('💎 Creating VIP plans...');

  await prisma.vipPlan.deleteMany({});

  const vipPlans = [
    // VIP FreeAds Plans
    {
      name: 'VIP FreeAds - 1 Tháng',
      vipType: VipType.VIP_FREEADS,
      durationDays: 30,
      priceVnd: 19000,
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
  // 4. DAILY TASKS - Gamification
  // ═══════════════════════════════════════════════════════════
  console.log('🎯 Creating daily tasks...');

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
  // 5. CHECK-IN REWARDS - Configuration
  // ═══════════════════════════════════════════════════════════
  console.log('📅 Creating check-in reward configuration...');

  const checkInRewards = [
    {
      day: 1,
      rewardGold: 10,
      description: 'Điểm danh ngày đầu tiên',
      isActive: true,
    },
    {
      day: 2,
      rewardGold: 15,
      description: 'Điểm danh ngày thứ 2',
      isActive: true,
    },
    {
      day: 3,
      rewardGold: 20,
      description: 'Điểm danh ngày thứ 3',
      isActive: true,
    },
    {
      day: 4,
      rewardGold: 25,
      description: 'Điểm danh ngày thứ 4',
      isActive: true,
    },
    {
      day: 5,
      rewardGold: 30,
      description: 'Điểm danh ngày thứ 5',
      isActive: true,
    },
    {
      day: 6,
      rewardGold: 40,
      description: 'Điểm danh ngày thứ 6',
      isActive: true,
    },
    {
      day: 7,
      rewardGold: 50,
      description: 'Điểm danh tuần đầy đủ - Thưởng lớn!',
      isActive: true,
    },
  ];

  for (const reward of checkInRewards) {
    await prisma.checkInReward.upsert({
      where: { day: reward.day },
      update: reward,
      create: reward,
    });
  }

  console.log('✅ Check-in rewards created\n');

  // ═══════════════════════════════════════════════════════════
  // 6. ACHIEVEMENTS - User Milestones
  // ═══════════════════════════════════════════════════════════
  console.log('🏆 Creating achievements...');

  await prisma.achievement.deleteMany({});

  const achievements = [
    {
      name: 'Bình luận đầu tiên',
      description: 'Để lại bình luận đầu tiên của bạn',
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
  // ═══════════════════════════════════════════════════════════
  console.log('🎭 Creating promotional banners...');

  // Delete existing banners
  await prisma.banner.deleteMany({});

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
      targetVipType: null,
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
  // 8. CTV AFFILIATES - 3-Tier Network Structure
  // ═══════════════════════════════════════════════════════════
  console.log('🤝 Creating 3-tier CTV affiliate network...');

  const ctvPassword = await bcrypt.hash('ctv123456', 12);
  
  // TIER 1 - Companies (managed by admin)
  const company1 = await prisma.ctvAffiliate.upsert({
    where: { email: 'company1@vietmedia.com' },
    update: {},
    create: {
      email: 'company1@vietmedia.com',
      nickname: 'VietMedia',
      passwordHash: ctvPassword,
      companyName: 'VietMedia Marketing Co.',
      realName: 'Nguyễn Văn Công Ty',
      phone: '0901111111',
      bankAccount: '1234567890',
      bankName: 'Vietcombank',
      commissionRate: 0.30, // 30% cho công ty
      referralCode: 'COMPANY01',
      referralUrl: 'https://vietshort.vn/?ref=COMPANY01',
      tier: 1,
      affiliateType: 'COMPANY',
      parentId: null,
      networkMembers: 4, // 2 tier-2 + 2 tier-3
      networkEarned: 15000000, // 15 triệu từ mạng lưới
      contractNotes: 'Hợp đồng hoa hồng 30% - Phát triển mạng lưới KOC',
      contractStartAt: new Date('2024-01-01'),
      contractEndAt: new Date('2025-12-31'),
      isActive: true,
      isVerified: true,
    },
  });

  const company2 = await prisma.ctvAffiliate.upsert({
    where: { email: 'company2@digitalads.com' },
    update: {},
    create: {
      email: 'company2@digitalads.com',
      nickname: 'DigitalAds',
      passwordHash: ctvPassword,
      companyName: 'Digital Ads Agency Vietnam',
      realName: 'Trần Thị Quảng Cáo',
      phone: '0902222222',
      bankAccount: '0987654321',
      bankName: 'Techcombank',
      commissionRate: 0.30,
      referralCode: 'COMPANY02',
      referralUrl: 'https://vietshort.vn/?ref=COMPANY02',
      tier: 1,
      affiliateType: 'COMPANY',
      parentId: null,
      networkMembers: 3, // 2 tier-2 + 1 tier-3
      networkEarned: 12000000,
      contractNotes: 'Hợp đồng 30% - Chuyên về quảng cáo số',
      contractStartAt: new Date('2024-02-01'),
      contractEndAt: new Date('2026-01-31'),
      isActive: true,
      isVerified: true,
    },
  });

  const company3 = await prisma.ctvAffiliate.upsert({
    where: { email: 'company3@socialhub.com' },
    update: {},
    create: {
      email: 'company3@socialhub.com',
      nickname: 'SocialHub',
      passwordHash: ctvPassword,
      companyName: 'Social Hub Agency',
      realName: 'Lê Văn Mạng Xã Hội',
      phone: '0903333333',
      bankAccount: '1122334455',
      bankName: 'ACB',
      commissionRate: 0.30,
      referralCode: 'COMPANY03',
      referralUrl: 'https://vietshort.vn/?ref=COMPANY03',
      tier: 1,
      affiliateType: 'COMPANY',
      parentId: null,
      networkMembers: 0,
      networkEarned: 0,
      contractNotes: 'Mới ký hợp đồng - chưa phát triển mạng lưới',
      contractStartAt: new Date('2026-02-01'),
      contractEndAt: new Date('2027-01-31'),
      isActive: true,
      isVerified: true,
    },
  });

  // TIER 2 - Individuals under companies
  const koc1 = await prisma.ctvAffiliate.upsert({
    where: { email: 'koc1@gmail.com' },
    update: {},
    create: {
      email: 'koc1@gmail.com',
      nickname: 'KOC_Anna',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Phạm Thị An',
      phone: '0911111111',
      bankAccount: '2233445566',
      bankName: 'Vietcombank',
      commissionRate: 0.20, // Công ty cho 20% (giữ 10%)
      referralCode: 'KOC0001',
      referralUrl: 'https://vietshort.vn/?ref=KOC0001',
      tier: 2,
      affiliateType: 'INDIVIDUAL',
      parentId: company1.id,
      networkMembers: 1, // 1 tier-3
      networkEarned: 5000000,
      isActive: true,
      isVerified: true,
    },
  });

  const koc2 = await prisma.ctvAffiliate.upsert({
    where: { email: 'koc2@gmail.com' },
    update: {},
    create: {
      email: 'koc2@gmail.com',
      nickname: 'KOC_Brian',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Đỗ Văn Bình',
      phone: '0912222222',
      bankAccount: '3344556677',
      bankName: 'Techcombank',
      commissionRate: 0.25,
      referralCode: 'KOC0002',
      referralUrl: 'https://vietshort.vn/?ref=KOC0002',
      tier: 2,
      affiliateType: 'INDIVIDUAL',
      parentId: company1.id,
      networkMembers: 1,
      networkEarned: 3000000,
      isActive: true,
      isVerified: true,
    },
  });

  const koc3 = await prisma.ctvAffiliate.upsert({
    where: { email: 'koc3@gmail.com' },
    update: {},
    create: {
      email: 'koc3@gmail.com',
      nickname: 'KOC_Carol',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Hoàng Thị Chi',
      phone: '0913333333',
      bankAccount: '4455667788',
      bankName: 'ACB',
      commissionRate: 0.22,
      referralCode: 'KOC0003',
      referralUrl: 'https://vietshort.vn/?ref=KOC0003',
      tier: 2,
      affiliateType: 'INDIVIDUAL',
      parentId: company2.id,
      networkMembers: 1,
      networkEarned: 4000000,
      isActive: true,
      isVerified: true,
    },
  });

  const koc4 = await prisma.ctvAffiliate.upsert({
    where: { email: 'koc4@gmail.com' },
    update: {},
    create: {
      email: 'koc4@gmail.com',
      nickname: 'KOC_David',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Vũ Văn Dũng',
      phone: '0914444444',
      bankAccount: '5566778899',
      bankName: 'VietinBank',
      commissionRate: 0.20,
      referralCode: 'KOC0004',
      referralUrl: 'https://vietshort.vn/?ref=KOC0004',
      tier: 2,
      affiliateType: 'INDIVIDUAL',
      parentId: company2.id,
      networkMembers: 0,
      networkEarned: 0,
      isActive: true,
      isVerified: true,
    },
  });

  // TIER 3 - Sub-individuals
  await prisma.ctvAffiliate.upsert({
    where: { email: 'user1@gmail.com' },
    update: {},
    create: {
      email: 'user1@gmail.com',
      nickname: 'User_Emily',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Nguyễn Thị Em',
      phone: '0921111111',
      bankAccount: '6677889900',
      bankName: 'Vietcombank',
      commissionRate: 0.15, // KOC cho 15% (giữ 5%)
      referralCode: 'USER0001',
      referralUrl: 'https://vietshort.vn/?ref=USER0001',
      tier: 3,
      affiliateType: 'INDIVIDUAL',
      parentId: koc1.id,
      networkMembers: 0,
      networkEarned: 0,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.ctvAffiliate.upsert({
    where: { email: 'user2@gmail.com' },
    update: {},
    create: {
      email: 'user2@gmail.com',
      nickname: 'User_Frank',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Trần Văn Phong',
      phone: '0922222222',
      bankAccount: '7788990011',
      bankName: 'Techcombank',
      commissionRate: 0.12,
      referralCode: 'USER0002',
      referralUrl: 'https://vietshort.vn/?ref=USER0002',
      tier: 3,
      affiliateType: 'INDIVIDUAL',
      parentId: koc2.id,
      networkMembers: 0,
      networkEarned: 0,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.ctvAffiliate.upsert({
    where: { email: 'user3@gmail.com' },
    update: {},
    create: {
      email: 'user3@gmail.com',
      nickname: 'User_Grace',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Lý Thị Giang',
      phone: '0923333333',
      bankAccount: '8899001122',
      bankName: 'ACB',
      commissionRate: 0.10,
      referralCode: 'USER0003',
      referralUrl: 'https://vietshort.vn/?ref=USER0003',
      tier: 3,
      affiliateType: 'INDIVIDUAL',
      parentId: koc3.id,
      networkMembers: 0,
      networkEarned: 0,
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ 3-tier CTV network created (3 companies + 4 KOCs + 3 users)\n');

  // ═══════════════════════════════════════════════════════════
  // 8.1. CTV PAYOUT REQUESTS - Withdrawal Requests
  // ═══════════════════════════════════════════════════════════
  console.log('💰 Creating CTV payout requests...');

  const payoutRequests = [
    {
      affiliateId: company1.id,
      amount: 10000000, // 10 triệu VND
      bankAccount: company1.bankAccount!,
      bankName: company1.bankName!,
      notes: 'Rút tiền tháng 1/2026',
      status: PayoutStatus.COMPLETED,
      processedBy: 'superadmin@vietshort.com',
      processedAt: new Date('2026-02-01'),
      createdAt: new Date('2026-01-25'),
    },
    {
      affiliateId: company1.id,
      amount: 5000000, // 5 triệu VND
      bankAccount: company1.bankAccount!,
      bankName: company1.bankName!,
      notes: 'Rút tiền tháng 2/2026',
      status: PayoutStatus.APPROVED,
      processedBy: 'admin@vietshort.com',
      processedAt: new Date('2026-02-10'),
      createdAt: new Date('2026-02-08'),
    },
    {
      affiliateId: company2.id,
      amount: 8000000,
      bankAccount: company2.bankAccount!,
      bankName: company2.bankName!,
      notes: 'Rút hoa hồng Q1/2026',
      status: PayoutStatus.PENDING,
      processedBy: null,
      processedAt: null,
      createdAt: new Date('2026-02-12'),
    },
    {
      affiliateId: koc1.id,
      amount: 3000000,
      bankAccount: koc1.bankAccount!,
      bankName: koc1.bankName!,
      notes: 'Rút tiền hoa hồng tháng 1',
      status: PayoutStatus.COMPLETED,
      processedBy: 'admin@vietshort.com',
      processedAt: new Date('2026-02-05'),
      createdAt: new Date('2026-02-01'),
    },
    {
      affiliateId: koc2.id,
      amount: 2000000,
      bankAccount: koc2.bankAccount!,
      bankName: koc2.bankName!,
      notes: 'Rút tiền - Bị từ chối vì chưa đủ doanh thu tối thiểu 3 triệu',
      status: PayoutStatus.REJECTED,
      processedBy: 'admin@vietshort.com',
      processedAt: new Date('2026-02-11'),
      createdAt: new Date('2026-02-10'),
    },
    {
      affiliateId: koc3.id,
      amount: 4000000,
      bankAccount: koc3.bankAccount!,
      bankName: koc3.bankName!,
      notes: 'Rút hoa hồng tháng 2',
      status: PayoutStatus.PENDING,
      processedBy: null,
      processedAt: null,
      createdAt: new Date('2026-02-13'),
    },
    {
      affiliateId: company3.id,
      amount: 500000,
      bankAccount: company3.bankAccount!,
      bankName: company3.bankName!,
      notes: 'Test rút tiền lần đầu - Chưa có doanh thu',
      status: PayoutStatus.REJECTED,
      processedBy: 'superadmin@vietshort.com',
      processedAt: new Date('2026-02-12'),
      createdAt: new Date('2026-02-11'),
    },
  ];

  for (const request of payoutRequests) {
    await prisma.ctvPayout.create({
      data: request,
    });
  }

  console.log('✅ Payout requests created\n');

  // ═══════════════════════════════════════════════════════════
  // 9. EXCHANGE CODES - Sample Batches & Codes
  // ═══════════════════════════════════════════════════════════
  console.log('🎟️  Creating code batches and exchange codes...');

  // Create batches first
  const batches = [
    {
      id: 'batch_welcome_2024',
      batchName: 'Welcome Pack 2024',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      quantity: 3,
      usageLimit: 1,
      codeLength: 10,
      codePrefix: 'WLC',
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      id: 'batch_vip_trial',
      batchName: 'VIP Trial Pack',
      rewardType: RewardType.VIP_DAYS,
      rewardValue: 7,
      quantity: 2,
      usageLimit: 1,
      codeLength: 8,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      id: 'batch_tet_2025',
      batchName: 'Tết 2025 Event',
      rewardType: RewardType.GOLD,
      rewardValue: 200,
      quantity: 2,
      usageLimit: 1,
      codeLength: 11,
      codePrefix: 'TET',
      isActive: true,
      expiresAt: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
  ];

  for (const batch of batches) {
    await prisma.codeBatch.upsert({
      where: { batchName: batch.batchName },
      update: {},
      create: batch,
    });
  }

  const exchangeCodes = [
    {
      code: 'WELCOME100',
      batchId: 'batch_welcome_2024',
      batchName: 'Welcome Pack 2024',
      description: 'Mã chào mừng người dùng mới - 100 vàng',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 10,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'WLC_GOLD200',
      batchId: 'batch_welcome_2024',
      batchName: 'Welcome Pack 2024',
      description: 'Welcome code 2',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'WLC_GOLD300',
      batchId: 'batch_welcome_2024',
      batchName: 'Welcome Pack 2024',
      description: 'Welcome code 3',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'VIP7DAYS',
      batchId: 'batch_vip_trial',
      batchName: 'VIP Trial Pack',
      description: 'Dùng thử VIP Gold 7 ngày miễn phí',
      rewardType: RewardType.VIP_DAYS,
      rewardValue: 7,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 8,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'VIP3TRIAL',
      batchId: 'batch_vip_trial',
      batchName: 'VIP Trial Pack',
      description: 'Dùng thử VIP Gold 3 ngày',
      rewardType: RewardType.VIP_DAYS,
      rewardValue: 7,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 9,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'NEWYEAR2025',
      batchId: 'batch_tet_2025',
      batchName: 'Tết 2025 Event',
      description: 'Mã Tết 2025 - 200 vàng',
      rewardType: RewardType.GOLD,
      rewardValue: 200,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'TET_GOLD500',
      batchId: 'batch_tet_2025',
      batchName: 'Tết 2025 Event',
      description: 'Mã Tết 500 vàng',
      rewardType: RewardType.GOLD,
      rewardValue: 200,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000),
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

  console.log('✅ Code batches and exchange codes created\n');

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
      vipTier: null,
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
      vipTier: VipType.VIP_FREEADS,
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
      vipTier: VipType.VIP_GOLD,
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
  console.log('🤝 CTV 3-TIER NETWORK STRUCTURE:');
  console.log('┌─────────────────────────────┬──────────┬──────────────┬──────────┐');
  console.log('│ Email                       │ Password │ Tier         │ Ref Code │');
  console.log('├─────────────────────────────┼──────────┼──────────────┼──────────┤');
  console.log('│ TIER 1 - COMPANIES (Admin manages)                              │');
  console.log('│ company1@vietmedia.com      │ ctv123456│ 1-COMPANY    │COMPANY01 │');
  console.log('│ company2@digitalads.com     │ ctv123456│ 1-COMPANY    │COMPANY02 │');
  console.log('│ company3@socialhub.com      │ ctv123456│ 1-COMPANY    │COMPANY03 │');
  console.log('├─────────────────────────────┼──────────┼──────────────┼──────────┤');
  console.log('│ TIER 2 - KOCs (Under companies)                                 │');
  console.log('│ koc1@gmail.com              │ ctv123456│ 2-INDIVIDUAL │ KOC0001  │');
  console.log('│ koc2@gmail.com              │ ctv123456│ 2-INDIVIDUAL │ KOC0002  │');
  console.log('│ koc3@gmail.com              │ ctv123456│ 2-INDIVIDUAL │ KOC0003  │');
  console.log('│ koc4@gmail.com              │ ctv123456│ 2-INDIVIDUAL │ KOC0004  │');
  console.log('├─────────────────────────────┼──────────┼──────────────┼──────────┤');
  console.log('│ TIER 3 - USERS (Under KOCs)                                     │');
  console.log('│ user1@gmail.com             │ ctv123456│ 3-INDIVIDUAL │ USER0001 │');
  console.log('│ user2@gmail.com             │ ctv123456│ 3-INDIVIDUAL │ USER0002 │');
  console.log('│ user3@gmail.com             │ ctv123456│ 3-INDIVIDUAL │ USER0003 │');
  console.log('└─────────────────────────────┴──────────┴──────────────┴──────────┘');
  console.log('');
  console.log('💰 PAYOUT REQUESTS:');
  console.log('┌─────────────────────────┬───────────┬─────────────────┐');
  console.log('│ Affiliate               │ Amount    │ Status          │');
  console.log('├─────────────────────────┼───────────┼─────────────────┤');
  console.log('│ company1@vietmedia.com  │ 10,000,000│ ✓ COMPLETED     │');
  console.log('│ company1@vietmedia.com  │  5,000,000│ ⏳ APPROVED     │');
  console.log('│ company2@digitalads.com │  8,000,000│ ⏳ PENDING      │');
  console.log('│ koc1@gmail.com          │  3,000,000│ ✓ COMPLETED     │');
  console.log('│ koc2@gmail.com          │  2,000,000│ ✗ REJECTED      │');
  console.log('│ koc3@gmail.com          │  4,000,000│ ⏳ PENDING      │');
  console.log('│ company3@socialhub.com  │    500,000│ ✗ REJECTED      │');
  console.log('└─────────────────────────┴───────────┴─────────────────┘');
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
  console.log('┌──────────────────┬─────────────────────────────────────┐');
  console.log('│ Batch            │ Codes / Reward                      │');
  console.log('├──────────────────┼─────────────────────────────────────┤');
  console.log('│ Welcome Pack 2024│ 3 codes / 100 Gold                  │');
  console.log('│ VIP Trial Pack   │ 2 codes / VIP 7 days                │');
  console.log('│ Tết 2025 Event   │ 2 codes / 200 Gold                  │');
  console.log('└──────────────────┴─────────────────────────────────────┘');
  console.log('');
  console.log('📊 DATA SEEDED:');
  console.log('  ✓ 20 Genre Tags (Tu Tiên, Hệ Thống, Ngược Tập...)');
  console.log('  ✓ 6 VIP Plans (FreeAds & Gold)');
  console.log('  ✓ 8 Daily Tasks');
  console.log('  ✓ 7 Check-in Reward Configurations');
  console.log('  ✓ 13 Achievements');
  console.log('  ✓ 3 Promotional Banners');
  console.log('  ✓ 10 CTV Affiliates (3 tier-1 + 4 tier-2 + 3 tier-3)');
  console.log('  ✓ 7 Payout Requests (2 completed, 1 approved, 2 pending, 2 rejected)');
  console.log('  ✓ 3 Code Batches + 7 Exchange Codes');
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