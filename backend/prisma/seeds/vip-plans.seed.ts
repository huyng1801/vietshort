import { PrismaClient, VipType } from '@prisma/client';

export async function seedVipPlans(prisma: PrismaClient) {
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
      discount: 0.14,
      description: 'Xem phim không quảng cáo trong 3 tháng - Tiết kiệm 14%',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'VIP FreeAds - 1 Năm',
      vipType: VipType.VIP_FREEADS,
      durationDays: 365,
      priceVnd: 179000,
      discount: 0.22,
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
      discount: 0.12,
      description: 'Không quảng cáo + 1080p + Phim độc quyền + Hỗ trợ ưu tiên - Tiết kiệm 12%',
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'VIP Gold - 1 Năm',
      vipType: VipType.VIP_GOLD,
      durationDays: 365,
      priceVnd: 469000,
      discount: 0.20,
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
}
