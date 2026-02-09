import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { EncodingStatus } from '@prisma/client';

@Injectable()
export class VideoQueueService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async addToEncodingQueue(episodeId: string, sourceUrl: string) {
    await this.prisma.episode.update({
      where: { id: episodeId },
      data: { encodingStatus: EncodingStatus.PROCESSING, encodingProgress: 0 },
    });

    await this.redisService.addToQueue('video-encoding', {
      episodeId,
      sourceUrl,
      qualities: ['360p', '480p', '720p', '1080p'],
      createdAt: new Date().toISOString(),
    });
  }

  async updateEncodingProgress(episodeId: string, progress: number) {
    await this.prisma.episode.update({
      where: { id: episodeId },
      data: { encodingProgress: progress },
    });

    await this.redisService.publish('encoding-progress', { episodeId, progress });
  }

  async completeEncoding(episodeId: string, hlsManifest: string, duration: number) {
    await this.prisma.episode.update({
      where: { id: episodeId },
      data: {
        encodingStatus: EncodingStatus.COMPLETED,
        encodingProgress: 100,
        hlsManifest,
        duration,
      },
    });

    await this.redisService.publish('encoding-complete', { episodeId, hlsManifest });
  }

  async failEncoding(episodeId: string, error: string) {
    await this.prisma.episode.update({
      where: { id: episodeId },
      data: { encodingStatus: EncodingStatus.FAILED },
    });

    await this.redisService.publish('encoding-error', { episodeId, error });
  }

  async getQueueStatus() {
    const [pending, processing, completed, failed] = await Promise.all([
      this.prisma.episode.count({ where: { encodingStatus: EncodingStatus.PENDING } }),
      this.prisma.episode.count({ where: { encodingStatus: EncodingStatus.PROCESSING } }),
      this.prisma.episode.count({ where: { encodingStatus: EncodingStatus.COMPLETED } }),
      this.prisma.episode.count({ where: { encodingStatus: EncodingStatus.FAILED } }),
    ]);
    return { pending, processing, completed, failed };
  }
}
