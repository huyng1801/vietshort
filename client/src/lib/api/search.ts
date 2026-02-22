import { api } from './client';
import type { PaginatedVideos } from './video';
import type { BaseVideo } from '@/types/video';

export interface SearchParams {
  q?: string;
  genre?: string;
  sort?: 'relevance' | 'newest' | 'views' | 'rating';
  year?: string;
  quality?: string;
  page?: number;
  limit?: number;
}

export const searchApi = {
  search: (params: SearchParams) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.genre) qs.set('genre', params.genre);
    if (params.sort) qs.set('sort', params.sort);
    if (params.year) qs.set('year', params.year);
    if (params.quality) qs.set('quality', params.quality);
    qs.set('page', String(params.page ?? 1));
    qs.set('limit', String(params.limit ?? 20));
    return api.get<PaginatedVideos>(`/search?${qs.toString()}`);
  },
  suggest: (q: string, limit = 8) =>
    api.get<BaseVideo[]>(`/search/suggest?q=${encodeURIComponent(q)}&limit=${limit}`),
};
