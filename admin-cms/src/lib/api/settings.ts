import { apiClient } from './client';

export const settingsAPI = {
  getSettings() {
    return apiClient.get('/admin/settings');
  },

  updateSettings(data: Record<string, unknown>) {
    return apiClient.patch('/admin/settings', data);
  },

  getAdminUsers(params?: Record<string, unknown>) {
    return apiClient.get('/admin/users/admins', { params });
  },

  createAdmin(data: { email: string; nickname: string; password: string; role: string }) {
    return apiClient.post('/admin/users/admins', data);
  },

  deleteAdmin(id: string) {
    return apiClient.delete(`/admin/users/admins/${id}`);
  },

  updateAdmin(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/users/admins/${id}`, data);
  },

  getUploadUrl(filename: string, contentType: string) {
    return apiClient.post('/admin/upload/presigned-url', { filename, contentType });
  },
};
