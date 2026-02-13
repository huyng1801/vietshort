export type VideoStatus = 'DRAFT' | 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
export type EpisodeStatus = 'PROCESSING' | 'READY' | 'FAILED';
export type VideoType = 'FREE' | 'VIP_FREEADS' | 'VIP_GOLD';
export type EpisodeAccessType = 'FREE' | 'VIP_FREEADS' | 'VIP_GOLD' | 'COIN';

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  poster?: string;
  backdrop?: string;
  trailerUrl?: string;
  
  // Metadata
  category: Category;
  categoryId: string;
  tags: string[];
  year: number;
  country: string;
  director?: string;
  cast?: string[];
  
  // Stats
  views: number;
  likes: number;
  rating: number;
  ratingCount: number;
  
  // Access
  type: VideoType;
  status: VideoStatus;
  totalEpisodes: number;
  publishedEpisodes: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface VideoDetail extends Video {
  episodes: Episode[];
  similarVideos?: Video[];
  userProgress?: {
    currentEpisode: number;
    progress: number;
    isBookmarked: boolean;
    isFavorite: boolean;
    userRating?: number;
  };
}

export interface Episode {
  id: string;
  videoId: string;
  episodeNumber: number;
  title: string;
  description?: string;
  thumbnail?: string;
  duration: number; // in seconds
  
  // Access
  accessType: EpisodeAccessType;
  coinPrice?: number;
  
  // Playback
  status: EpisodeStatus;
  hlsUrl?: string;
  qualities?: VideoQuality[];
  subtitles?: Subtitle[];
  
  // Stats
  views: number;
  
  // Timestamps
  createdAt: string;
  publishedAt?: string;
}

export interface VideoQuality {
  quality: string; // e.g., '360p', '720p', '1080p'
  url: string;
  bitrate: number;
}

export interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  videoCount?: number;
}

export interface VideoFilterParams {
  category?: string;
  type?: VideoType;
  year?: number;
  country?: string;
  sortBy?: 'newest' | 'trending' | 'rating' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface VideoSearchParams extends VideoFilterParams {
  q: string;
}

export interface PlaybackProgress {
  episodeId: string;
  progress: number;
  duration: number;
  completedAt?: string;
}