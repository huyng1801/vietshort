import { api } from './client';

export const likesApi = {
  toggle: (videoId: string) => api.post<{ liked: boolean }>(`/likes/toggle/${videoId}`, undefined, true),
  check: (videoId: string) => api.get<{ liked: boolean }>(`/likes/check/${videoId}`, true),
  list: (page = 1, limit = 20) => api.get<any>(`/likes?page=${page}&limit=${limit}`, true),
};

export const ratingsApi = {
  rate: (videoId: string, rating: number, review?: string) =>
    api.post<any>(`/ratings/${videoId}`, { rating, review }, true),
  myRating: (videoId: string) => api.get<any>(`/ratings/me/${videoId}`, true),
  videoRatings: (videoId: string, page = 1) =>
    api.get<any>(`/ratings/video/${videoId}?page=${page}`),
};

export const commentsApi = {
  byVideo: (videoId: string, page = 1, limit = 20) =>
    api.get<any>(`/comments/video/${videoId}?page=${page}&limit=${limit}`),
  replies: (commentId: string, page = 1, limit = 10) =>
    api.get<any>(`/comments/${commentId}/replies?page=${page}&limit=${limit}`),
  create: (data: { videoId: string; content: string; parentId?: string }) =>
    api.post<any>('/comments', data, true),
  update: (id: string, data: { content: string }) =>
    api.put<any>(`/comments/${id}`, data, true),
  delete: (id: string) => api.delete<any>(`/comments/${id}`, true),
  report: (id: string) => api.post<any>(`/comments/${id}/report`, undefined, true),
};

export const bookmarksApi = {
  list: (page = 1, limit = 20) => api.get<any>(`/likes?page=${page}&limit=${limit}`, true),
  toggle: (videoId: string) => api.post<{ liked: boolean }>(`/likes/toggle/${videoId}`, undefined, true),
  check: (videoId: string) => api.get<{ liked: boolean }>(`/likes/check/${videoId}`, true),
};

export const bannerApi = {
  list: (limit = 10) => api.get<any>(`/client/banners?limit=${limit}`),
};

export const recommendApi = {
  forUser: (limit = 20) => api.get<any[]>(`/recommendations?limit=${limit}`, true),
  similar: (videoId: string, limit = 10) =>
    api.get<any[]>(`/recommendations/similar/${videoId}?limit=${limit}`),
};
