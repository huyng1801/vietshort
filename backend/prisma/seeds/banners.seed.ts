import { PrismaClient } from '@prisma/client';

export async function seedBanners(prisma: PrismaClient) {
  console.log('🎭 Creating promotional banners...');

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
}
