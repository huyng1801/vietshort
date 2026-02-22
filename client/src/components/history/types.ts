import type { BaseVideo } from '@/types/video';

export interface WatchHistoryItem {
  id: string;
  videoId: string;
  episodeId?: string;
  watchTime: number;
  progressive: number;
  isCompleted: boolean;
  updatedAt: string;
  video: BaseVideo & {
    slug: string;
    poster: string;
    duration: number;
  };
  episode?: {
    episodeNumber: number;
    title?: string;
  };
}
