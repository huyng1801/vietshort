import { apiClient } from './client';

export const authAPI = {
  login(email: string, password: string) {
    return apiClient.post('/admin/login', { email, password });
  },

  getProfile() {
    return apiClient.get('/admin/profile');
  },

  updateProfile(data: { nickname?: string; firstName?: string; lastName?: string }) {
    return apiClient.patch('/admin/profile', data);
  },

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiClient.post('/admin/profile/change-password', data);
  },
};
