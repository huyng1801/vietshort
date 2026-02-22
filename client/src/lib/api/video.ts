import { api } from './client';
import type { VideoCardData } from '@/types/video';
import type { WatchHistoryItem } from '@/components/history/types';
import type { VideoData } from '@/components/watch';

export interface PaginatedVideos {
  data: VideoCardData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const videoApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return api.get<PaginatedVideos>(`/videos${qs}`);
  },
  trending: (limit = 12) => api.get<VideoCardData[]>(`/videos/trending?limit=${limit}`),
  newReleases: (limit = 12) => api.get<VideoCardData[]>(`/videos/new-releases?limit=${limit}`),
  genres: () => api.get<{ id: string; name: string; slug: string; description?: string }[]>('/videos/genres'),
  byGenre: (genre: string, limit = 12) =>
    api.get<PaginatedVideos>(`/videos?genre=${encodeURIComponent(genre)}&limit=${limit}&status=PUBLISHED`),
  detail: (id: string) => api.get<Record<string, unknown>>(`/videos/${id}`),
  bySlug: (slug: string) => api.get<VideoData>(`/videos/slug/${slug}`),
  incrementView: (id: string) => api.post(`/videos/${id}/view`),
  checkAccess: (episodeId: string) => api.get<{ hasAccess: boolean; unlockPrice?: number }>(`/videos/episodes/${episodeId}/access`, true),
  getStreamUrl: (episodeId: string) => api.get<{ url: string }>(`/videos/episodes/${episodeId}/stream`, true),
  updateProgress: (videoId: string, data: { episodeId?: string; progressive: number }) =>
    api.post(`/videos/${videoId}/watch-progress`, data, true),
};

export interface SubtitleRaw {
  id: string;
  label?: string;
  language: string;
  status: string;
  srtUrl?: string;
  content?: string;
}

export const subtitleApi = {
  byEpisode: (episodeId: string) => api.get<SubtitleRaw[]>(`/subtitles/episode/${episodeId}`),
};

export interface PaginatedWatchHistory {
  data: WatchHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const watchHistoryApi = {
  list: (page = 1, limit = 12) =>
    api.get<PaginatedWatchHistory>(`/users/watch-history?page=${page}&limit=${limit}`, true),
};
