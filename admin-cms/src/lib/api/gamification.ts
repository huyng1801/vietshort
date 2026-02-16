import { apiClient, sanitizeParams } from './client';

export const gamificationAPI = {
  // Overview
  getGamificationOverview() {
    return apiClient.get('/admin/gamification/overview');
  },

  // Daily Tasks
  getDailyTasks(params?: Record<string, unknown>) {
    return apiClient.get('/admin/gamification/daily-tasks', { params: sanitizeParams(params) });
  },

  getDailyTask(id: string) {
    return apiClient.get(`/admin/gamification/daily-tasks/${id}`);
  },

  getDailyTaskStats() {
    return apiClient.get('/admin/gamification/daily-tasks/stats');
  },

  createDailyTask(data: Record<string, unknown>) {
    return apiClient.post('/admin/gamification/daily-tasks', data);
  },

  updateDailyTask(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/gamification/daily-tasks/${id}`, data);
  },

  deleteDailyTask(id: string) {
    return apiClient.delete(`/admin/gamification/daily-tasks/${id}`);
  },

  toggleDailyTask(id: string) {
    return apiClient.post(`/admin/gamification/daily-tasks/${id}/toggle`);
  },

  reorderDailyTasks(taskIds: string[]) {
    return apiClient.post('/admin/gamification/daily-tasks/reorder', { taskIds });
  },

  // Achievements
  getAchievements(params?: Record<string, unknown>) {
    return apiClient.get('/admin/gamification/achievements', { params: sanitizeParams(params) });
  },

  getAchievement(id: string) {
    return apiClient.get(`/admin/gamification/achievements/${id}`);
  },

  getAchievementStats() {
    return apiClient.get('/admin/gamification/achievements/stats');
  },

  createAchievement(data: Record<string, unknown>) {
    return apiClient.post('/admin/gamification/achievements', data);
  },

  updateAchievement(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/gamification/achievements/${id}`, data);
  },

  deleteAchievement(id: string) {
    return apiClient.delete(`/admin/gamification/achievements/${id}`);
  },

  toggleAchievement(id: string) {
    return apiClient.post(`/admin/gamification/achievements/${id}/toggle`);
  },

  // Check-in Rewards
  getCheckInRewards() {
    return apiClient.get('/admin/gamification/check-in-rewards');
  },

  getCheckInStats() {
    return apiClient.get('/admin/gamification/check-in-rewards/stats');
  },

  updateCheckInReward(data: Record<string, unknown>) {
    return apiClient.patch('/admin/gamification/check-in-rewards', data);
  },

  bulkUpdateCheckInRewards(rewards: Record<string, unknown>[]) {
    return apiClient.post('/admin/gamification/check-in-rewards/bulk', { rewards });
  },
};
