import { apiClient, sanitizeParams } from './client';

export const affiliatesAPI = {
  // Affiliates (CTV) - 3-tier hierarchy
  getAffiliates(params?: Record<string, unknown>) {
    return apiClient.get('/admin/payouts/affiliates', { params: sanitizeParams(params) });
  },

  getAffiliate(id: string) {
    return apiClient.get(`/admin/payouts/affiliates/${id}`);
  },

  getAffiliateTree(id: string) {
    return apiClient.get(`/admin/payouts/affiliates/${id}/tree`);
  },

  getSubAffiliates(parentId: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/payouts/affiliates/${parentId}/sub-affiliates`, { params: sanitizeParams(params) });
  },

  getNetworkStats(id: string) {
    return apiClient.get(`/admin/payouts/affiliates/${id}/network-stats`);
  },

  createAffiliate(data: Record<string, unknown>) {
    return apiClient.post('/admin/payouts/affiliates', data);
  },

  updateAffiliate(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/payouts/affiliates/${id}`, data);
  },

  toggleAffiliateStatus(id: string, isActive: boolean) {
    return apiClient.post(`/admin/payouts/affiliates/${id}/toggle-status`, { isActive });
  },

  getAffiliateReferrals(id: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/payouts/affiliates/${id}/referrals`, { params: sanitizeParams(params) });
  },

  getAffiliatePayouts(id: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/payouts/affiliates/${id}/payouts`, { params: sanitizeParams(params) });
  },

  getPendingPayouts(params?: Record<string, unknown>) {
    return apiClient.get('/admin/payouts/pending', { params: sanitizeParams(params) });
  },

  approvePayout(id: string) {
    return apiClient.post(`/admin/payouts/${id}/approve`);
  },

  rejectPayout(id: string, reason?: string) {
    return apiClient.post(`/admin/payouts/${id}/reject`, { reason });
  },
};
