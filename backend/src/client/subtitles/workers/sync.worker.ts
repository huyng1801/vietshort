import { Logger } from '@nestjs/common';

export class SyncWorker {
  private readonly logger = new Logger(SyncWorker.name);

  async syncSubtitles(segments: SyncSegment[], audioPath?: string): Promise<SyncSegment[]> {
    this.logger.log('Synchronizing subtitles...');

    // TODO: Implement subtitle sync using audio analysis
    // This adjusts subtitle timing to match actual speech in the video

    return segments;
  }

  generateSrt(segments: SyncSegment[]): string {
    return segments.map((segment, index) => {
      const startTime = this.formatTime(segment.start);
      const endTime = this.formatTime(segment.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
    }).join('\n');
  }

  parseSrt(srtContent: string): SyncSegment[] {
    const blocks = srtContent.trim().split(/\n\n+/);
    return blocks.map((block) => {
      const lines = block.split('\n');
      const [startStr, endStr] = (lines[1] || '').split(' --> ');
      return {
        index: parseInt(lines[0], 10),
        start: this.parseTime(startStr || '00:00:00,000'),
        end: this.parseTime(endStr || '00:00:00,000'),
        text: lines.slice(2).join('\n'),
      };
    });
  }

  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  private parseTime(timeStr: string): number {
    const [time, ms] = timeStr.split(',');
    const [h, m, s] = (time || '00:00:00').split(':').map(Number);
    return h * 3600 + m * 60 + s + (parseInt(ms || '0', 10) / 1000);
  }
}

export interface SyncSegment {
  index: number;
  start: number;
  end: number;
  text: string;
}
