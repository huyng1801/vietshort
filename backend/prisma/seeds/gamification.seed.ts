import { PrismaClient, DailyTaskType, AchievementCondition } from '@prisma/client';

export async function seedGamification(prisma: PrismaClient) {
  // ═══════════════════════════════════════════════════════════
  // DAILY TASKS
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
    },
  ];

  for (const task of dailyTasks) {
    await prisma.dailyTask.create({
      data: task,
    });
  }

  console.log('✅ Daily tasks created');

  // ═══════════════════════════════════════════════════════════
  // CHECK-IN REWARDS
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

  console.log('✅ Check-in rewards created');

  // ═══════════════════════════════════════════════════════════
  // ACHIEVEMENTS
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
}
