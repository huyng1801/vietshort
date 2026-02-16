import { apiClient } from './client';

export const dashboardAPI = {
  getDashboardStats() {
    return apiClient.get('/admin/dashboard');
  },

  getRecentActivity(limit = 10) {
    return apiClient.get('/admin/dashboard/activity', { params: { limit } });
  },
};
