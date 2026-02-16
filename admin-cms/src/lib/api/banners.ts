import { apiClient, sanitizeParams } from './client';

export const bannersAPI = {
  getBannerMaxSortOrder() {
    return apiClient.get('/admin/banners/max-sort-order');
  },

  getBanners(params?: Record<string, unknown>) {
    return apiClient.get('/admin/banners', { params: sanitizeParams(params) });
  },

  getBanner(id: string) {
    return apiClient.get(`/admin/banners/${id}`);
  },

  createBanner(data: Record<string, unknown>) {
    return apiClient.post('/admin/banners', data);
  },

  updateBanner(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/banners/${id}`, data);
  },

  deleteBanner(id: string) {
    return apiClient.delete(`/admin/banners/${id}`);
  },

  reorderBanners(ids: string[]) {
    return apiClient.post('/admin/banners/reorder', { ids });
  },

  uploadBannerImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/admin/banners/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
