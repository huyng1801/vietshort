import { VideoStatus, AgeRating, VipType } from '@prisma/client';

export interface VideoEntity {
  id: string;
  title: string;
  description?: string;
  slug: string;
  poster?: string;
  duration?: number;
  releaseYear?: number;
  director?: string;
  actors?: string;
  country?: string;
  language: string;
  isSerial: boolean;
  totalEpisodes?: number;
  ageRating: AgeRating;
  genres?: string;
  isVipOnly: boolean;
  vipTier?: VipType;
  unlockPrice?: number;
  status: VideoStatus;
  publishedAt?: Date;
  viewCount: number;
  likeCount: number;
  ratingAverage?: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}
