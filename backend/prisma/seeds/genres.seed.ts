import { PrismaClient } from '@prisma/client';

export async function seedGenres(prisma: PrismaClient) {
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
}
