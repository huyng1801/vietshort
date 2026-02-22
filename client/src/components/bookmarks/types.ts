import type { BaseVideo } from '@/types/video';

export interface BookmarkItem {
  id: string;
  videoId: string;
  createdAt: string;
  video: BaseVideo & {
    slug: string;
    poster: string;
    isVipOnly?: boolean;
    releaseYear?: number;
  };
}
