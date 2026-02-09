import { Module } from '@nestjs/common';
import { SubtitlesController } from './subtitles.controller';
import { SubtitlesService } from './subtitles.service';
import { WhisperWorker } from './workers/whisper.worker';
import { TranslateWorker } from './workers/translate.worker';
import { SyncWorker } from './workers/sync.worker';

@Module({
  controllers: [SubtitlesController],
  providers: [
    SubtitlesService,
    WhisperWorker,
    TranslateWorker,
    SyncWorker,
  ],
  exports: [
    SubtitlesService,
    WhisperWorker,
    TranslateWorker,
    SyncWorker,
  ],
})
export class SubtitlesModule {}
