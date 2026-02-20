import { PrismaClient } from '@prisma/client';

export async function seedGoldPackages(prisma: PrismaClient) {
  console.log('💰 Creating Gold packages...');

  await prisma.goldPackage.deleteMany({});

  const goldPackages = [
    {
      name: 'Gói 50 Gold',
      goldAmount: 50,
      bonusGold: 0,
      priceVnd: 10000,
      isPopular: false,
      isActive: true,
      sortOrder: 1,
      description: 'Gói nạp Gold cơ bản',
    },
    {
      name: 'Gói 100 Gold',
      goldAmount: 100,
      bonusGold: 0,
      priceVnd: 19000,
      isPopular: false,
      isActive: true,
      sortOrder: 2,
      description: 'Gói nạp 100 Gold',
    },
    {
      name: 'Gói 300 Gold',
      goldAmount: 300,
      bonusGold: 30,
      priceVnd: 49000,
      isPopular: true,
      isActive: true,
      sortOrder: 3,
      description: 'Gói phổ biến nhất - Tặng thêm 30 Gold',
    },
    {
      name: 'Gói 500 Gold',
      goldAmount: 500,
      bonusGold: 60,
      priceVnd: 79000,
      isPopular: false,
      isActive: true,
      sortOrder: 4,
      description: 'Gói nạp 500 Gold - Tặng thêm 60 Gold',
    },
    {
      name: 'Gói 1000 Gold',
      goldAmount: 1000,
      bonusGold: 150,
      priceVnd: 149000,
      isPopular: false,
      isActive: true,
      sortOrder: 5,
      description: 'Gói nạp 1000 Gold - Tặng thêm 150 Gold',
    },
    {
      name: 'Gói 3000 Gold',
      goldAmount: 3000,
      bonusGold: 500,
      priceVnd: 399000,
      isPopular: false,
      isActive: true,
      sortOrder: 6,
      description: 'Gói nạp lớn nhất - Tặng thêm 500 Gold',
    },
  ];

  for (const pkg of goldPackages) {
    await prisma.goldPackage.create({ data: pkg });
  }

  console.log(`  ✓ Created ${goldPackages.length} gold packages\n`);
}
