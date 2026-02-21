import { SubtitleTrack } from '@/components/video/VideoPlayer';

export interface VideoData {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  slug: string;
  genres?: string;
  releaseYear?: number;
  director?: string;
  actors?: string;
  isSerial: boolean;
  totalEpisodes?: number;
  viewCount?: number;
  likeCount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  isVipOnly?: boolean;
  episodes: EpisodeData[];
}

export interface EpisodeData {
  id: string;
  episodeNumber: number;
  title?: string;
  hlsManifest?: string;
  duration?: number;
  encodingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  subtitles?: SubtitleTrack[];
}

export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
