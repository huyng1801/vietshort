import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { HlsStreamingService } from './services/hls-streaming.service';
import { VideoQueueService } from './services/video-queue.service';

@Module({
  controllers: [VideosController],
  providers: [VideosService, HlsStreamingService, VideoQueueService],
  exports: [VideosService, HlsStreamingService, VideoQueueService],
})
export class VideosModule {}
