import { apiClient, sanitizeParams } from './client';

export const adsAPI = {
  // Ads Config (global settings)
  getAdsConfig() {
    return apiClient.get('/admin/ads/config');
  },

  updateAdsConfig(data: Record<string, unknown>) {
    return apiClient.patch('/admin/ads/config', data);
  },

  // Ad Placements CRUD
  getAdPlacements(params?: Record<string, unknown>) {
    return apiClient.get('/admin/ads/placements', { params: sanitizeParams(params) });
  },

  getAdPlacement(id: string) {
    return apiClient.get(`/admin/ads/placements/${id}`);
  },

  createAdPlacement(data: Record<string, unknown>) {
    return apiClient.post('/admin/ads/placements', data);
  },

  updateAdPlacement(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/ads/placements/${id}`, data);
  },

  deleteAdPlacement(id: string) {
    return apiClient.delete(`/admin/ads/placements/${id}`);
  },

  toggleAdPlacement(id: string, isActive: boolean) {
    return apiClient.post(`/admin/ads/placements/${id}/toggle`, { isActive });
  },

  // Ad Revenue / Stats
  getAdRevenueSummary(params?: Record<string, unknown>) {
    return apiClient.get('/admin/ads/revenue/summary', { params: sanitizeParams(params) });
  },

  getAdRevenueChart(params?: Record<string, unknown>) {
    return apiClient.get('/admin/ads/revenue/chart', { params: sanitizeParams(params) });
  },
};
