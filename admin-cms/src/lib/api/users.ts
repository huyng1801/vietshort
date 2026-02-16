import { apiClient, sanitizeParams } from './client';

export const usersAPI = {
  getUsers(params: Record<string, unknown>) {
    return apiClient.get('/admin/users', { params: sanitizeParams(params) });
  },

  getUser(id: string) {
    return apiClient.get(`/admin/users/${id}`);
  },

  updateUser(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/users/${id}`, data);
  },

  updateUserBalance(id: string, data: { amount: number; reason: string }) {
    return apiClient.post(`/admin/users/${id}/balance`, data);
  },

  getUserTransactions(id: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/users/${id}/transactions`, { params: sanitizeParams(params) });
  },

  lockUser(id: string, reason: string) {
    return apiClient.post(`/admin/users/${id}/lock`, { reason });
  },

  unlockUser(id: string) {
    return apiClient.post(`/admin/users/${id}/unlock`);
  },

  adjustUserGold(id: string, data: { amount: number; reason: string }) {
    return apiClient.put(`/admin/users/${id}/gold`, data);
  },

  adjustUserVip(id: string, data: { vipType: string; vipDays: number }) {
    return apiClient.put(`/admin/users/${id}/vip`, data);
  },

  removeUserVip(id: string) {
    return apiClient.post(`/admin/users/${id}/remove-vip`);
  },

  getUserWatchHistory(id: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/users/${id}/watch-history`, { params: sanitizeParams(params) });
  },

  getUserUnlockHistory(id: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/users/${id}/unlocks`, { params: sanitizeParams(params) });
  },

  getUserCheckInHistory(id: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/users/${id}/check-ins`, { params: sanitizeParams(params) });
  },

  getUserEngagement(id: string) {
    return apiClient.get(`/admin/users/${id}/engagement`);
  },

  getUserReferrals(id: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/users/${id}/referrals`, { params: sanitizeParams(params) });
  },

  getUserAuditLogs(id: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/users/${id}/audit-logs`, { params: sanitizeParams(params) });
  },

  getUserAchievements(id: string) {
    return apiClient.get(`/admin/users/${id}/achievements`);
  },

  getUserDailyTasks(id: string, date?: string) {
    return apiClient.get(`/admin/users/${id}/daily-tasks`, { params: sanitizeParams({ date }) });
  },

  banUser(id: string, reason: string) {
    return apiClient.post(`/admin/users/${id}/ban`, { reason });
  },

  unbanUser(id: string) {
    return apiClient.post(`/admin/users/${id}/unban`);
  },
};
