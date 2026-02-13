import { EncodingStatus } from '@prisma/client';

export interface EpisodeEntity {
  id: string;
  videoId: string;
  episodeNumber: number;
  title?: string;
  description?: string;
  hlsManifest?: string;
  mp4Url?: string;
  unlockPrice?: number;
  isFree: boolean;
  encodingStatus: EncodingStatus;
  encodingProgress: number;
  createdAt: Date;
  updatedAt: Date;
}
