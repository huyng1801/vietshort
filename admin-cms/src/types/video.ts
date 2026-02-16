// ===== Video & Content Types =====

export type VideoStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';
export type EncodingStatusType = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type SubtitleStatusType = 'READY' | 'QUEUED' | 'EXTRACTING' | 'TRANSCRIBING' | 'TRANSLATING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';

export interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string;
  poster?: string;
  duration?: number;
  releaseYear?: number;
  director?: string;
  actors?: string;
  country?: string;
  language?: string;
  genres?: string;
  isSerial: boolean;
  totalEpisodes?: number;
  ageRating: string;
  isVipOnly: boolean;
  vipTier?: string;
  unlockPrice?: number;
  status: VideoStatus;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  favoriteCount: number;
  commentCount: number;
  ratingAverage: number;
  ratingCount: number;
  episodes?: Episode[];
  _count?: { episodes: number; comments: number; likes: number; favorites: number };
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: string;
  videoId: string;
  episodeNumber: number;
  title?: string;
  description?: string;
  sourceUrl?: string;
  hlsManifest?: string;
  mp4Url?: string;
  unlockPrice?: number;
  encodingStatus: EncodingStatusType;
  encodingProgress: number;
  encodingError?: string;
  duration?: number;
  subtitles?: Subtitle[];
  video?: { id: string; title: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

export interface Subtitle {
  id: string;
  episodeId: string;
  language: string;
  label?: string;
  content?: string;
  srtUrl?: string;
  isAuto: boolean;
  status: SubtitleStatusType;
  progress: number;
  error?: string;
  episode?: {
    id: string;
    episodeNumber: number;
    title?: string;
    videoId: string;
    video?: { id: string; title: string; slug: string };
  };
  createdAt: string;
  updatedAt?: string;
}

export interface SubtitleQueueStatus {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  breakdown: {
    extracting: number;
    transcribing: number;
    translating: number;
    uploading: number;
  };
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  videoCount?: number;
  createdAt: string;
  updatedAt: string;
}



export interface EncodingJob {
  id: string;
  videoId: string;
  episodeNumber: number;
  title?: string;
  encodingStatus: EncodingStatusType;
  encodingProgress: number;
  encodingError?: string;
  video: { id: string; title: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { videos: number };
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkType: 'video' | 'external' | 'promotion';
  linkTarget?: string;
  sortOrder: number;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
  targetVipType?: 'VIP_FREEADS' | 'VIP_GOLD' | null;
  createdAt: string;
  updatedAt: string;
}
