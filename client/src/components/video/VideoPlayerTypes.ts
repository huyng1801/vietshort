/**
 * Video player types and interfaces
 */

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url: string;
  isDefault?: boolean;
}

export interface QualityLevel {
  height: number;
  bitrate: number;
  label: string;
}

export interface VideoPlayerProps {
  src: string | null;
  poster?: string;
  title?: string;
  episodeNumber?: number;
  subtitles?: SubtitleTrack[];
  onEnded?: () => void;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  autoPlay?: boolean;
  initialTime?: number;
}
