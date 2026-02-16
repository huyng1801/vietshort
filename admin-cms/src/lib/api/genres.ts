import { apiClient, sanitizeParams } from './client';

export const genresAPI = {
  getMaxSortOrder() {
    return apiClient.get('/admin/genres/max-sort-order');
  },

  getGenres(params?: Record<string, unknown>) {
    return apiClient.get('/admin/genres', { params: sanitizeParams(params) });
  },

  getGenre(id: string) {
    return apiClient.get(`/admin/genres/${id}`);
  },

  createGenre(data: Record<string, unknown>) {
    return apiClient.post('/admin/genres', data);
  },

  updateGenre(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/genres/${id}`, data);
  },

  deleteGenre(id: string) {
    return apiClient.delete(`/admin/genres/${id}`);
  },
};
