import { PrismaClient, TransactionType, TransactionStatus, UnlockMethod } from '@prisma/client';

export async function seedInteractions(prisma: PrismaClient, users: any[], videos: any) {
  console.log('💬 Creating sample user interactions...');

  const [user1, user2, user3] = users;
  const { video1, video2, video3 } = videos;

  // ═══════════════════════════════════════════════════════════
  // WATCH HISTORY
  // ═══════════════════════════════════════════════════════════
  const video1Episodes = await prisma.episode.findMany({
    where: { videoId: video1.id },
    orderBy: { episodeNumber: 'asc' },
  });

  const video3Episodes = await prisma.episode.findMany({
    where: { videoId: video3.id },
    orderBy: { episodeNumber: 'asc' },
  });

  // User1 watched video1 episode 1 & 2
  for (let i = 0; i < 2 && i < video1Episodes.length; i++) {
    const ep = video1Episodes[i];
    await prisma.watchHistory.upsert({
      where: {
        userId_episodeId: {
          userId: user1.id,
          episodeId: ep.id,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        videoId: video1.id,
        episodeId: ep.id,
        watchTime: ep.duration || 1200,
        progressive: ep.duration || 1200,
        isCompleted: true,
        createdAt: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // User2 watched video3 episode 1
  if (video3Episodes.length > 0) {
    await prisma.watchHistory.upsert({
      where: {
        userId_episodeId: {
          userId: user2.id,
          episodeId: video3Episodes[0].id,
        },
      },
      update: {},
      create: {
        userId: user2.id,
        videoId: video3.id,
        episodeId: video3Episodes[0].id,
        watchTime: 800,
        progressive: 1500,
        isCompleted: false,
      },
    });
  }

  // User3 watched video1 episode 1-3
  for (let i = 0; i < 3 && i < video1Episodes.length; i++) {
    const ep = video1Episodes[i];
    await prisma.watchHistory.upsert({
      where: {
        userId_episodeId: {
          userId: user3.id,
          episodeId: ep.id,
        },
      },
      update: {},
      create: {
        userId: user3.id,
        videoId: video1.id,
        episodeId: ep.id,
        watchTime: ep.duration || 1200,
        progressive: ep.duration || 1200,
        isCompleted: true,
        createdAt: new Date(Date.now() - (3 - i) * 12 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Watch history created');

  // ═══════════════════════════════════════════════════════════
  // FAVORITES
  // ═══════════════════════════════════════════════════════════
  await prisma.favorite.upsert({
    where: {
      userId_videoId: {
        userId: user1.id,
        videoId: video1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      videoId: video1.id,
    },
  });

  await prisma.favorite.upsert({
    where: {
      userId_videoId: {
        userId: user2.id,
        videoId: video3.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      videoId: video3.id,
    },
  });

  await prisma.favorite.upsert({
    where: {
      userId_videoId: {
        userId: user3.id,
        videoId: video1.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      videoId: video1.id,
    },
  });

  console.log('✅ Favorites created');

  // ═══════════════════════════════════════════════════════════
  // LIKES
  // ═══════════════════════════════════════════════════════════
  await prisma.like.upsert({
    where: {
      userId_videoId: {
        userId: user1.id,
        videoId: video1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      videoId: video1.id,
    },
  });

  await prisma.like.upsert({
    where: {
      userId_videoId: {
        userId: user2.id,
        videoId: video1.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      videoId: video1.id,
    },
  });

  await prisma.like.upsert({
    where: {
      userId_videoId: {
        userId: user3.id,
        videoId: video3.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      videoId: video3.id,
    },
  });

  console.log('✅ Likes created');

  // ═══════════════════════════════════════════════════════════
  // RATINGS (VIP users only)
  // ═══════════════════════════════════════════════════════════
  await prisma.rating.upsert({
    where: {
      userId_videoId: {
        userId: user2.id,
        videoId: video1.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      videoId: video1.id,
      rating: 5,
      review: 'Phim hay lắm, cực kỳ cuốn hút!',
    },
  });

  await prisma.rating.upsert({
    where: {
      userId_videoId: {
        userId: user3.id,
        videoId: video1.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      videoId: video1.id,
      rating: 4,
      review: 'Nội dung hay, diễn xuất tốt',
    },
  });

  await prisma.rating.upsert({
    where: {
      userId_videoId: {
        userId: user3.id,
        videoId: video3.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      videoId: video3.id,
      rating: 5,
      review: 'Cực phẩm ngược tập!',
    },
  });

  console.log('✅ Ratings created');

  // ═══════════════════════════════════════════════════════════
  // COMMENTS
  // ═══════════════════════════════════════════════════════════
  const comment1 = await prisma.comment.create({
    data: {
      userId: user1.id,
      videoId: video1.id,
      content: 'Phim hay quá mọi người ơi! Đợi tập tiếp theo mỏi mắt luôn',
      isApproved: true,
    },
  });

  await prisma.comment.create({
    data: {
      userId: user2.id,
      videoId: video1.id,
      parentId: comment1.id,
      content: 'Đồng ý luôn, nội dung quá đỉnh',
      isApproved: true,
    },
  });

  await prisma.comment.create({
    data: {
      userId: user3.id,
      videoId: video3.id,
      content: 'Cảnh ngược tập sướng quá! Main đập mặt bọn khinh thường mình',
      isApproved: true,
    },
  });

  await prisma.comment.create({
    data: {
      userId: user1.id,
      videoId: video3.id,
      content: 'Tập này hơi chậm nhưng vẫn ok',
      isApproved: true,
    },
  });

  console.log('✅ Comments created');

  // ═══════════════════════════════════════════════════════════
  // VIDEO UNLOCKS
  // ═══════════════════════════════════════════════════════════
  // User1 unlocked video1 episode 3 with gold
  if (video1Episodes.length >= 3) {
    await prisma.videoUnlock.upsert({
      where: {
        userId_episodeId: {
          userId: user1.id,
          episodeId: video1Episodes[2].id,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        episodeId: video1Episodes[2].id,
        method: UnlockMethod.GOLD,
        goldSpent: 50,
      },
    });
  }

  // User2 unlocked video3 episode 2 by watching ad
  if (video3Episodes.length >= 2) {
    await prisma.videoUnlock.upsert({
      where: {
        userId_episodeId: {
          userId: user2.id,
          episodeId: video3Episodes[1].id,
        },
      },
      update: {},
      create: {
        userId: user2.id,
        episodeId: video3Episodes[1].id,
        method: UnlockMethod.AD,
        adWatched: true,
      },
    });
  }

  console.log('✅ Video unlocks created');

  // ═══════════════════════════════════════════════════════════
  // TRANSACTIONS
  // ═══════════════════════════════════════════════════════════
  await prisma.transaction.create({
    data: {
      userId: user1.id,
      type: TransactionType.PURCHASE_GOLD,
      amount: 50000, // 500 VND * 100 (cents)
      rewardValue: 500, // 500 gold coins
      description: 'Nạp 500 vàng qua VNPay',
      status: TransactionStatus.COMPLETED,
      provider: 'VNPAY',
      providerTxId: 'VNPAY_20260214_001',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user1.id,
      type: TransactionType.SPEND_GOLD,
      amount: 0, // No payment, just gold deduction
      rewardValue: -50, // Lost 50 gold coins
      description: 'Mở khóa Phàm Công Chi Lộ - Tập 3',
      status: TransactionStatus.COMPLETED,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user2.id,
      type: TransactionType.PURCHASE_VIP,
      amount: 49000, // VIP subscription price
      rewardValue: 30, // 30 days VIP
      description: 'Đăng ký VIP FreeAds 1 tháng',
      status: TransactionStatus.COMPLETED,
      provider: 'MOMO',
      providerTxId: 'MOMO_20260214_002',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user3.id,
      type: TransactionType.CHECKIN_REWARD,
      amount: 0, // No payment, just reward
      rewardValue: 50, // 50 gold coins reward
      description: 'Điểm danh ngày thứ 7',
      status: TransactionStatus.COMPLETED,
    },
  });

  console.log('✅ Transactions created');

  // ═══════════════════════════════════════════════════════════
  // CHECK-INS
  // ═══════════════════════════════════════════════════════════
  const today = new Date();
  
  for (let i = 0; i < 3; i++) {
    const checkInDate = new Date(today);
    checkInDate.setDate(checkInDate.getDate() - (2 - i));
    
    await prisma.checkIn.create({
      data: {
        userId: user3.id,
        date: checkInDate,
        day: i + 1,
        rewardGold: 10 + i * 5,
      },
    });
  }

  await prisma.checkIn.create({
    data: {
      userId: user1.id,
      date: today,
      day: 1,
      rewardGold: 10,
    },
  });

  console.log('✅ Check-ins created');

  // ═══════════════════════════════════════════════════════════
  // EXCHANGE CODE REDEEMS
  // ═══════════════════════════════════════════════════════════
  const exchangeCodes = await prisma.exchangeCode.findMany({
    take: 3,
    where: { isActive: true },
  });

  if (exchangeCodes.length >= 2) {
    // User1 redeemed first code
    await prisma.exchangeRedeem.upsert({
      where: {
        userId_codeId: {
          userId: user1.id,
          codeId: exchangeCodes[0].id,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        codeId: exchangeCodes[0].id,
        ipAddress: '192.168.1.100',
        deviceId: 'device_user1',
        redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    // User2 redeemed second code
    await prisma.exchangeRedeem.upsert({
      where: {
        userId_codeId: {
          userId: user2.id,
          codeId: exchangeCodes[1].id,
        },
      },
      update: {},
      create: {
        userId: user2.id,
        codeId: exchangeCodes[1].id,
        ipAddress: '192.168.1.101',
        deviceId: 'device_user2',
        redeemedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Exchange code redeems created');

  // ═══════════════════════════════════════════════════════════
  // CTV REFERRALS
  // ═══════════════════════════════════════════════════════════
  const ctvAffiliates = await prisma.ctvAffiliate.findMany({
    where: { tier: { in: [2, 3] } },
    take: 2,
  });

  if (ctvAffiliates.length >= 1) {
    // User1 was referred by first CTV affiliate
    await prisma.ctvReferral.upsert({
      where: {
        affiliateId_userId: {
          affiliateId: ctvAffiliates[0].id,
          userId: user1.id,
        },
      },
      update: {},
      create: {
        affiliateId: ctvAffiliates[0].id,
        userId: user1.id,
        clickedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        registeredAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        firstPurchaseAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        totalRevenue: 5000000, // 50,000 VND in cents
        totalCommission: 1000000, // 10,000 VND commission (20%)
        ipAddress: '192.168.1.100',
        referrerUrl: 'https://facebook.com/ctv-post',
      },
    });

    if (ctvAffiliates.length >= 2) {
      // User2 was referred by second CTV affiliate
      await prisma.ctvReferral.upsert({
        where: {
          affiliateId_userId: {
            affiliateId: ctvAffiliates[1].id,
            userId: user2.id,
          },
        },
        update: {},
        create: {
          affiliateId: ctvAffiliates[1].id,
          userId: user2.id,
          clickedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          registeredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          firstPurchaseAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          totalRevenue: 4900000,
          totalCommission: 980000,
          ipAddress: '192.168.1.101',
          referrerUrl: 'https://tiktok.com/@ctv-video',
        },
      });
    }
  }

  console.log('✅ CTV referrals created');

  // ═══════════════════════════════════════════════════════════
  // USER DAILY TASK PROGRESS
  // ═══════════════════════════════════════════════════════════
  const dailyTasks = await prisma.dailyTask.findMany({
    where: { isActive: true },
    take: 4,
  });

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  if (dailyTasks.length >= 3) {
    // User1 completed first task today
    await prisma.userDailyTaskProgress.upsert({
      where: {
        userId_taskId_date: {
          userId: user1.id,
          taskId: dailyTasks[0].id,
          date: todayDate,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        taskId: dailyTasks[0].id,
        date: todayDate,
        currentCount: dailyTasks[0].targetCount,
        isCompleted: true,
        completedAt: new Date(),
        rewardClaimed: true,
      },
    });

    // User1 in progress on second task
    await prisma.userDailyTaskProgress.upsert({
      where: {
        userId_taskId_date: {
          userId: user1.id,
          taskId: dailyTasks[1].id,
          date: todayDate,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        taskId: dailyTasks[1].id,
        date: todayDate,
        currentCount: Math.floor(dailyTasks[1].targetCount / 2),
        isCompleted: false,
        rewardClaimed: false,
      },
    });

    // User3 completed first 3 tasks
    for (let i = 0; i < 3; i++) {
      await prisma.userDailyTaskProgress.upsert({
        where: {
          userId_taskId_date: {
            userId: user3.id,
            taskId: dailyTasks[i].id,
            date: todayDate,
          },
        },
        update: {},
        create: {
          userId: user3.id,
          taskId: dailyTasks[i].id,
          date: todayDate,
          currentCount: dailyTasks[i].targetCount,
          isCompleted: true,
          completedAt: new Date(Date.now() - (3 - i) * 60 * 60 * 1000),
          rewardClaimed: true,
        },
      });
    }
  }

  console.log('✅ User daily task progress created');

  // ═══════════════════════════════════════════════════════════
  // USER ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
    take: 5,
  });

  if (achievements.length >= 3) {
    // User1 unlocked first achievement
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId: user1.id,
          achievementId: achievements[0].id,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        achievementId: achievements[0].id,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        rewardClaimed: true,
      },
    });

    // User3 unlocked multiple achievements
    for (let i = 0; i < Math.min(3, achievements.length); i++) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId: user3.id,
            achievementId: achievements[i].id,
          },
        },
        update: {},
        create: {
          userId: user3.id,
          achievementId: achievements[i].id,
          unlockedAt: new Date(Date.now() - (10 - i * 2) * 24 * 60 * 60 * 1000),
          rewardClaimed: true,
        },
      });
    }

    // User2 unlocked achievement but hasn't claimed reward yet
    if (achievements.length >= 2) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId: user2.id,
            achievementId: achievements[1].id,
          },
        },
        update: {},
        create: {
          userId: user2.id,
          achievementId: achievements[1].id,
          unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          rewardClaimed: false,
        },
      });
    }
  }

  console.log('✅ User achievements created\n');
}
