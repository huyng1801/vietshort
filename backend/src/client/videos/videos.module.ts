import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { HlsStreamingService } from './services/hls-streaming.service';

@Module({
  controllers: [VideosController],
  providers: [
    VideosService,
    HlsStreamingService,
  ],
  exports: [
    VideosService,
    HlsStreamingService,
  ],
})
export class VideosModule {}
