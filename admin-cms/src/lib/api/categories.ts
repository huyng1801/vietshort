import { apiClient, sanitizeParams } from './client';

export const categoriesAPI = {
  getCategories(params?: Record<string, unknown>) {
    return apiClient.get('/admin/categories', { params: sanitizeParams(params) });
  },

  getCategory(id: string) {
    return apiClient.get(`/admin/categories/${id}`);
  },

  createCategory(data: Record<string, unknown>) {
    return apiClient.post('/admin/categories', data);
  },

  updateCategory(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/categories/${id}`, data);
  },

  deleteCategory(id: string) {
    return apiClient.delete(`/admin/categories/${id}`);
  },
};
