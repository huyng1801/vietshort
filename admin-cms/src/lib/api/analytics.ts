import { apiClient, sanitizeParams } from './client';

export const analyticsAPI = {
  getAnalyticsOverview(params?: Record<string, unknown>) {
    return apiClient.get('/admin/analytics/overview', { params: sanitizeParams(params) });
  },

  getViewsAnalytics(params?: Record<string, unknown>) {
    return apiClient.get('/admin/analytics/views', { params: sanitizeParams(params) });
  },

  getRevenueAnalytics(params?: Record<string, unknown>) {
    return apiClient.get('/admin/analytics/revenue', { params: sanitizeParams(params) });
  },

  getUserAnalytics(params?: Record<string, unknown>) {
    return apiClient.get('/admin/analytics/users', { params: sanitizeParams(params) });
  },
};
