import { PrismaClient, VideoStatus, AgeRating, EncodingStatus, VipType } from '@prisma/client';

export async function seedVideos(prisma: PrismaClient) {
  console.log('🎬 Creating sample videos and episodes...');

  // Get some genres for assignment
  const tuTienGenre = await prisma.genre.findUnique({ where: { slug: 'tu-tien' } });
  const nguocTapGenre = await prisma.genre.findUnique({ where: { slug: 'nguoc-tap' } });
  const heThongGenre = await prisma.genre.findUnique({ where: { slug: 'he-thong' } });
  const tongTaiGenre = await prisma.genre.findUnique({ where: { slug: 'tong-tai-sung-vo' } });

  // ═══════════════════════════════════════════════════════════
  // VIDEO 1: Tu Tiên Series (Free)
  // ═══════════════════════════════════════════════════════════
  const video1 = await prisma.video.upsert({
    where: { slug: 'phan-cong-chi-lo-tu-tien' },
    update: {},
    create: {
      title: 'Phàm Công Chi Lộ - Tu Tiên',
      slug: 'phan-cong-chi-lo-tu-tien',
      description: 'Một thiếu niên bình thường bước vào con đường tu tiên, trải qua vô số gian khổ để trở thành bậc tôn giả',
      poster: '/posters/tu-tien-1.jpg',
      duration: null,
      releaseYear: 2024,
      director: 'Trương Nghệ Mưu',
      actors: 'Vương Nhất Bác, Tiêu Chiến',
      country: 'China',
      language: 'zh-CN',
      genres: 'tu-tien,he-thong,nguoc-tap',
      isSerial: true,
      totalEpisodes: 80,
      ageRating: AgeRating.ALL,
      isVipOnly: false,
      vipTier: null,
      unlockPrice: null,
      status: VideoStatus.PUBLISHED,
      publishedAt: new Date('2024-01-01'),
      viewCount: 15000,
      likeCount: 1200,
      shareCount: 300,
      favoriteCount: 800,
      commentCount: 150,
      ratingAverage: 4.5,
      ratingCount: 500,
    },
  });

  // Create 5 episodes for video 1
  for (let i = 1; i <= 5; i++) {
    await prisma.episode.upsert({
      where: { 
        videoId_episodeNumber: {
          videoId: video1.id,
          episodeNumber: i,
        }
      },
      update: {},
      create: {
        videoId: video1.id,
        episodeNumber: i,
        title: `Tập ${i}: ${i === 1 ? 'Khởi Đầu Hành Trình' : i === 2 ? 'Gặp Sư Phụ' : i === 3 ? 'Nhập Môn Tu Luyện' : i === 4 ? 'Đột Phá Cảnh Giới' : 'Thử Thách Đầu Tiên'}`,
        description: `Nội dung tập ${i}`,
        sourceUrl: `r2://raw/videos/${video1.id}/ep-${i}/source.mp4`,
        hlsManifest: `https://cdn.vietshort.vn/videos/${video1.id}/ep-${i}/master.m3u8`,
        mp4Url: `https://cdn.vietshort.vn/videos/${video1.id}/ep-${i}/720p.mp4`,
        unlockPrice: i <= 2 ? null : 50, // Tập 1-2 free, từ tập 3 trở đi tốn 50 gold
        encodingStatus: EncodingStatus.COMPLETED,
        encodingProgress: 100,
        duration: 1200 + i * 60, // ~20-25 minutes per episode
      },
    });
  }

 


  // ═══════════════════════════════════════════════════════════
  // VIDEO 2: VIP Only Series
  // ═══════════════════════════════════════════════════════════
  const video2 = await prisma.video.upsert({
    where: { slug: 'tong-tai-hung-han-sung-vo' },
    update: {},
    create: {
      title: 'Tổng Tài Hùng Hãn Sủng Vợ',
      slug: 'tong-tai-hung-han-sung-vo',
      description: 'Tổng tài quyền lực gặp gỡ cô gái bình thường và bắt đầu cuộc tình ngọt ngào',
      poster: '/posters/tong-tai-1.jpg',
      duration: null,
      releaseYear: 2024,
      director: 'Lý An',
      actors: 'Dương Mịch, Triệu Lệ Dĩnh',
      country: 'China',
      language: 'zh-CN',
      genres: 'tong-tai-sung-vo,ngot-sung',
      isSerial: true,
      totalEpisodes: 60,
      ageRating: AgeRating.ALL,
      isVipOnly: true,
      vipTier: VipType.VIP_GOLD,
      unlockPrice: null,
      status: VideoStatus.PUBLISHED,
      publishedAt: new Date('2024-02-01'),
      viewCount: 8000,
      likeCount: 950,
      shareCount: 200,
      favoriteCount: 600,
      commentCount: 80,
      ratingAverage: 4.8,
      ratingCount: 300,
    },
  });

  // Create 3 episodes for video 2 (VIP only)
  for (let i = 1; i <= 3; i++) {
    await prisma.episode.upsert({
      where: {
        videoId_episodeNumber: {
          videoId: video2.id,
          episodeNumber: i,
        }
      },
      update: {},
      create: {
        videoId: video2.id,
        episodeNumber: i,
        title: `Tập ${i}`,
        description: `Nội dung chỉ dành cho VIP Gold - Tập ${i}`,
        sourceUrl: `r2://raw/videos/${video2.id}/ep-${i}/source.mp4`,
        hlsManifest: `https://cdn.vietshort.vn/videos/${video2.id}/ep-${i}/master.m3u8`,
        mp4Url: `https://cdn.vietshort.vn/videos/${video2.id}/ep-${i}/720p.mp4`,
        unlockPrice: null, // VIP-only, không cần unlock riêng
        encodingStatus: EncodingStatus.COMPLETED,
        encodingProgress: 100,
        duration: 1800, // 30 minutes
      },
    });
  }


  // ═══════════════════════════════════════════════════════════
  // VIDEO 3: Ngược Tập Series (Partially free)
  // ═══════════════════════════════════════════════════════════
  const video3 = await prisma.video.upsert({
    where: { slug: 'phe-vat-nguoc-tap-thanh-dai-lao' },
    update: {},
    create: {
      title: 'Phế Vật Ngược Tập Thành Đại Lão',
      slug: 'phe-vat-nguoc-tap-thanh-dai-lao',
      description: 'Từ một phế vật bị khinh thường, anh ta đã ngược tập trở thành đại lão khiến thiên hạ kinh hoảng',
      poster: '/posters/nguoc-tap-1.jpg',
      duration: null,
      releaseYear: 2024,
      director: 'Trần Khải Ca',
      actors: 'Hồ Ca, Lưu Diệc Phi',
      country: 'China',
      language: 'zh-CN',
      genres: 'nguoc-tap,he-thong,phe-vat-nguoc-tap',
      isSerial: true,
      totalEpisodes: 100,
      ageRating: AgeRating.ALL,
      isVipOnly: false,
      vipTier: null,
      unlockPrice: 2000, // Unlock toàn bộ series với 2000 gold
      status: VideoStatus.PUBLISHED,
      publishedAt: new Date('2024-01-15'),
      viewCount: 25000,
      likeCount: 2100,
      shareCount: 500,
      favoriteCount: 1500,
      commentCount: 300,
      ratingAverage: 4.7,
      ratingCount: 850,
    },
  });

  // Create 4 episodes for video 3
  for (let i = 1; i <= 4; i++) {
    await prisma.episode.upsert({
      where: {
        videoId_episodeNumber: {
          videoId: video3.id,
          episodeNumber: i,
        }
      },
      update: {},
      create: {
        videoId: video3.id,
        episodeNumber: i,
        title: `Tập ${i}`,
        description: `Hành trình ngược tập - Tập ${i}`,
        sourceUrl: `r2://raw/videos/${video3.id}/ep-${i}/source.mp4`,
        hlsManifest: `https://cdn.vietshort.vn/videos/${video3.id}/ep-${i}/master.m3u8`,
        mp4Url: `https://cdn.vietshort.vn/videos/${video3.id}/ep-${i}/720p.mp4`,
        unlockPrice: i === 1 ? null : 100, // Tập 1 free, các tập sau 100 gold
        encodingStatus: EncodingStatus.COMPLETED,
        encodingProgress: 100,
        duration: 1500,
      },
    });
  }


  console.log('✅ Sample videos and episodes created\n');

  return {
    video1,
    video2,
    video3,
  };
}
