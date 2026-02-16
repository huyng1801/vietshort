import { PrismaClient, SubtitleStatus } from '@prisma/client';

export async function seedSubtitles(prisma: PrismaClient, videos: any) {
  console.log('📝 Creating sample subtitles...');

  const { video1, video2, video3 } = videos;

  // Get episodes for each video
  const video1Episodes = await prisma.episode.findMany({
    where: { videoId: video1.id },
    orderBy: { episodeNumber: 'asc' },
    take: 3,
  });

  const video2Episodes = await prisma.episode.findMany({
    where: { videoId: video2.id },
    orderBy: { episodeNumber: 'asc' },
    take: 2,
  });

  // ═══════════════════════════════════════════════════════════
  // SUBTITLES FOR VIDEO 1 EPISODES
  // ═══════════════════════════════════════════════════════════
  for (const episode of video1Episodes) {
    // Vietnamese subtitles (manual)
    await prisma.subtitle.upsert({
      where: {
        episodeId_language: {
          episodeId: episode.id,
          language: 'vi',
        },
      },
      update: {},
      create: {
          episodeId: episode.id,
          language: 'en',
          label: 'English',
          srtUrl: null,
          isAuto: true,
          status: SubtitleStatus.TRANSCRIBING,
          progress: 65,
      },
    });

    // English subtitles (AI-generated)
    await prisma.subtitle.upsert({
      where: {
        episodeId_language: {
          episodeId: episode.id,
          language: 'en',
        },
      },
      update: {},
      create: {
        episodeId: episode.id,
        language: 'en',
        label: 'English',
        srtUrl: `/subtitles/video1/ep${episode.episodeNumber}_en.srt`,
        isAuto: true,
        status: SubtitleStatus.READY,
        progress: 100,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // SUBTITLES FOR VIDEO 2 EPISODES
  // ═══════════════════════════════════════════════════════════
  for (const episode of video2Episodes) {
    // Vietnamese subtitles only
    await prisma.subtitle.upsert({
      where: {
        episodeId_language: {
          episodeId: episode.id,
          language: 'vi',
        },
      },
      update: {},
      create: {
        episodeId: episode.id,
        language: 'vi',
        label: 'Tiếng Việt',
        srtUrl: `/subtitles/video2/ep${episode.episodeNumber}_vi.srt`,
        isAuto: false,
        status: SubtitleStatus.READY,
        progress: 100,
      },
    });

    // English subtitles in processing state
    if (episode.episodeNumber === 1) {
      await prisma.subtitle.upsert({
        where: {
          episodeId_language: {
            episodeId: episode.id,
            language: 'en',
          },
        },
        update: {},
        create: {
          episodeId: episode.id,
          language: 'en',
          label: 'English',
          srtUrl: null,
          isAuto: true,
          status: SubtitleStatus.TRANSCRIBING,
          progress: 65,
        },
      });
    }
  }

  console.log('✅ Subtitles created');
}
