import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Backend admin API is served on 3000 in dev/test env; allow override via env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

// Use API_URL directly - backend runs on port 3001 for now
const FINAL_API_URL = API_URL;

// Helper: Sanitize params for API requests
const sanitizeParams = (params?: Record<string, unknown>): Record<string, unknown> => {
  if (!params) return {};
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Skip undefined and null values
    if (value === undefined || value === null) continue;
    
    // Convert page and limit to integers
    if (key === 'page' || key === 'limit') {
      const num = parseInt(String(value), 10);
      if (!isNaN(num) && num >= 1) {
        sanitized[key] = num;
      }
    } else if (typeof value === 'string' && value.trim()) {
      // Only include non-empty strings
      sanitized[key] = value;
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      // Include booleans and numbers
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

class AdminAPI {
  private client: AxiosInstance;

  constructor() {
    console.log('🔧 AdminAPI - Final URL:', FINAL_API_URL);
    this.client = axios.create({
      baseURL: `${FINAL_API_URL}/api/v1`,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('admin_token');
        console.log('🔐 Interceptor - Found token:', token ? 'YES' : 'NO');
        if (token) {
          console.log('🔗 Adding Bearer token to headers');
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('admin_refresh_token');
          if (refreshToken) {
            try {
              const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });
              localStorage.setItem('admin_token', res.data.data.accessToken);
              error.config.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
              return this.client(error.config);
            } catch {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_refresh_token');
              window.location.href = '/login';
            }
          } else {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth
  login(email: string, password: string) {
    return this.client.post('/admin/login', { email, password });
  }

  getProfile() {
    return this.client.get('/admin/profile');
  }

  updateProfile(data: { nickname?: string; firstName?: string; lastName?: string }) {
    return this.client.patch('/admin/profile', data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.client.post('/admin/profile/change-password', data);
  }

  // Dashboard
  getDashboardStats() {
    return this.client.get('/admin/dashboard');
  }

  getRecentActivity(limit = 10) {
    return this.client.get('/admin/dashboard/activity', { params: { limit } });
  }

  // ═══ Videos (Production Flow) ═══
  getVideos(params: Record<string, unknown>) {
    return this.client.get('/admin/videos', { params: sanitizeParams(params) });
  }

  getVideo(id: string) {
    return this.client.get(`/admin/videos/${id}`);
  }

  // Step 1: Create video metadata only (no file upload)
  createVideo(data: Record<string, unknown>) {
    return this.client.post('/admin/videos', data);
  }

  updateVideo(id: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/videos/${id}`, data);
  }

  deleteVideo(id: string) {
    return this.client.delete(`/admin/videos/${id}`);
  }

  // Step 8: Publish / Unpublish
  publishVideo(id: string) {
    return this.client.post(`/admin/videos/${id}/publish`);
  }

  unpublishVideo(id: string) {
    return this.client.post(`/admin/videos/${id}/unpublish`);
  }

  // Poster presigned upload
  getPosterUploadUrl(videoId: string, contentType: string) {
    return this.client.post(`/admin/videos/${videoId}/poster-upload-url`, { contentType });
  }

  updatePoster(videoId: string, poster: string) {
    return this.client.patch(`/admin/videos/${videoId}/poster`, { poster });
  }

  // ═══ Episodes ═══

  // Step 2: Create episode (before upload)
  getEpisodes(videoId: string) {
    return this.client.get(`/admin/videos/${videoId}/episodes`);
  }

  createEpisode(videoId: string, data: Record<string, unknown>) {
    return this.client.post(`/admin/videos/${videoId}/episodes`, data);
  }

  getEpisode(episodeId: string) {
    return this.client.get(`/admin/videos/episodes/${episodeId}`);
  }

  updateEpisode(episodeId: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/videos/episodes/${episodeId}`, data);
  }

  deleteEpisode(episodeId: string) {
    return this.client.delete(`/admin/videos/episodes/${episodeId}`);
  }

  // Step 3: Get presigned upload URL for raw video
  getEpisodeUploadUrl(episodeId: string, contentType: string) {
    return this.client.post(`/admin/videos/episodes/${episodeId}/upload-url`, { contentType });
  }

  // Step 4: Trigger encode
  processEpisode(episodeId: string) {
    return this.client.post(`/admin/videos/episodes/${episodeId}/process`);
  }

  // Step 5: Retry failed encode
  reprocessEpisode(episodeId: string) {
    return this.client.post(`/admin/videos/episodes/${episodeId}/reprocess`);
  }

  // Step 7: Subtitles
  addEpisodeSubtitle(episodeId: string, data: { language: string; content: string; isAuto?: boolean }) {
    return this.client.post(`/admin/videos/episodes/${episodeId}/subtitles`, data);
  }

  deleteSubtitleById(subtitleId: string) {
    return this.client.delete(`/admin/videos/subtitles/${subtitleId}`);
  }

  // Encoding Queue
  getEncodingQueue(params?: Record<string, unknown>) {
    return this.client.get('/admin/videos/encoding-queue', { params: sanitizeParams(params) });
  }

  getEncodingStats() {
    return this.client.get('/admin/videos/encoding-stats');
  }

  // Banners
  getBannerMaxSortOrder() {
    return this.client.get('/admin/banners/max-sort-order');
  }

  getBanners(params?: Record<string, unknown>) {
    return this.client.get('/admin/banners', { params: sanitizeParams(params) });
  }

  getBanner(id: string) {
    return this.client.get(`/admin/banners/${id}`);
  }

  createBanner(data: Record<string, unknown>) {
    return this.client.post('/admin/banners', data);
  }

  updateBanner(id: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/banners/${id}`, data);
  }

  deleteBanner(id: string) {
    return this.client.delete(`/admin/banners/${id}`);
  }

  // Video unique genres
  getVideoGenres() {
    return this.client.get('/admin/videos/unique-genres');
  }

  reorderBanners(ids: string[]) {
    return this.client.post('/admin/banners/reorder', { ids });
  }

  uploadBannerImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.client.post('/admin/banners/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Categories
  getCategories(params?: Record<string, unknown>) {
    return this.client.get('/admin/categories', { params: sanitizeParams(params) });
  }

  getCategory(id: string) {
    return this.client.get(`/admin/categories/${id}`);
  }

  createCategory(data: Record<string, unknown>) {
    return this.client.post('/admin/categories', data);
  }

  updateCategory(id: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/categories/${id}`, data);
  }

  deleteCategory(id: string) {
    return this.client.delete(`/admin/categories/${id}`);
  }

  // Genres
  getMaxSortOrder() {
    return this.client.get('/admin/genres/max-sort-order');
  }

  getGenres(params?: Record<string, unknown>) {
    return this.client.get('/admin/genres', { params: sanitizeParams(params) });
  }

  getGenre(id: string) {
    return this.client.get(`/admin/genres/${id}`);
  }

  createGenre(data: Record<string, unknown>) {
    return this.client.post('/admin/genres', data);
  }

  updateGenre(id: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/genres/${id}`, data);
  }

  deleteGenre(id: string) {
    return this.client.delete(`/admin/genres/${id}`);
  }

  // Users
  getUsers(params: Record<string, unknown>) {
    return this.client.get('/admin/users', { params: sanitizeParams(params) });
  }

  getUser(id: string) {
    return this.client.get(`/admin/users/${id}`);
  }

  updateUser(id: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/users/${id}`, data);
  }

  updateUserBalance(id: string, data: { amount: number; reason: string }) {
    return this.client.post(`/admin/users/${id}/balance`, data);
  }

  getUserTransactions(id: string, params?: Record<string, unknown>) {
    return this.client.get(`/admin/users/${id}/transactions`, { params: sanitizeParams(params) });
  }

  lockUser(id: string, reason: string) {
    return this.client.post(`/admin/users/${id}/lock`, { reason });
  }

  unlockUser(id: string) {
    return this.client.post(`/admin/users/${id}/unlock`);
  }

  banUser(id: string, reason: string) {
    return this.client.post(`/admin/users/${id}/ban`, { reason });
  }

  unbanUser(id: string) {
    return this.client.post(`/admin/users/${id}/unban`);
  }

  // Analytics
  getAnalyticsOverview(params?: Record<string, unknown>) {
    return this.client.get('/admin/analytics/overview', { params: sanitizeParams(params) });
  }

  getViewsAnalytics(params?: Record<string, unknown>) {
    return this.client.get('/admin/analytics/views', { params: sanitizeParams(params) });
  }

  getRevenueAnalytics(params?: Record<string, unknown>) {
    return this.client.get('/admin/analytics/revenue', { params: sanitizeParams(params) });
  }

  getUserAnalytics(params?: Record<string, unknown>) {
    return this.client.get('/admin/analytics/users', { params: sanitizeParams(params) });
  }

  // Affiliates (CTV) - 3-tier hierarchy
  getAffiliates(params?: Record<string, unknown>) {
    return this.client.get('/admin/payouts/affiliates', { params: sanitizeParams(params) });
  }

  getAffiliate(id: string) {
    return this.client.get(`/admin/payouts/affiliates/${id}`);
  }

  getAffiliateTree(id: string) {
    return this.client.get(`/admin/payouts/affiliates/${id}/tree`);
  }

  getSubAffiliates(parentId: string, params?: Record<string, unknown>) {
    return this.client.get(`/admin/payouts/affiliates/${parentId}/sub-affiliates`, { params: sanitizeParams(params) });
  }

  getNetworkStats(id: string) {
    return this.client.get(`/admin/payouts/affiliates/${id}/network-stats`);
  }

  createAffiliate(data: Record<string, unknown>) {
    return this.client.post('/admin/payouts/affiliates', data);
  }

  updateAffiliate(id: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/payouts/affiliates/${id}`, data);
  }

  toggleAffiliateStatus(id: string, isActive: boolean) {
    return this.client.post(`/admin/payouts/affiliates/${id}/toggle-status`, { isActive });
  }

  getAffiliateReferrals(id: string, params?: Record<string, unknown>) {
    return this.client.get(`/admin/payouts/affiliates/${id}/referrals`, { params: sanitizeParams(params) });
  }

  getAffiliatePayouts(id: string, params?: Record<string, unknown>) {
    return this.client.get(`/admin/payouts/affiliates/${id}/payouts`, { params: sanitizeParams(params) });
  }

  getPendingPayouts(params?: Record<string, unknown>) {
    return this.client.get('/admin/payouts/pending', { params: sanitizeParams(params) });
  }

  approvePayout(id: string) {
    return this.client.post(`/admin/payouts/${id}/approve`);
  }

  rejectPayout(id: string, reason?: string) {
    return this.client.post(`/admin/payouts/${id}/reject`, { reason });
  }

  // Exchange Codes
  getExchangeCodes(params?: Record<string, unknown>) {
    return this.client.get('/exchange-codes', { params: sanitizeParams(params) });
  }

  createExchangeCode(data: Record<string, unknown>) {
    return this.client.post('/exchange-codes', data);
  }

  // Code Batch Management
  getCodeBatches(params?: Record<string, unknown>) {
    return this.client.get('/exchange-codes/batches', { params: sanitizeParams(params) });
  }

  getCodeBatch(id: string) {
    return this.client.get(`/exchange-codes/batches/${id}`);
  }

  createCodeBatch(data: Record<string, unknown>) {
    return this.client.post('/exchange-codes/batches', data);
  }

  getCodeRedemptions(batchId: string, params?: Record<string, unknown>) {
    return this.client.get(`/exchange-codes/batches/${batchId}/redemptions`, { params: sanitizeParams(params) });
  }

  exportCodes(batchId: string) {
    return this.client.get(`/exchange-codes/batches/${batchId}/export`, {
      responseType: 'blob',
    });
  }

  deactivateCodeBatch(id: string) {
    return this.client.post(`/exchange-codes/batches/${id}/deactivate`);
  }

  // Subtitles — new subtitle management API
  getSubtitlesOverview(params?: Record<string, unknown>) {
    return this.client.get('/admin/subtitles', { params: sanitizeParams(params) });
  }

  getSubtitleQueueStatus() {
    return this.client.get('/admin/subtitles/queue-status');
  }

  getVideoSubtitles(videoId: string) {
    return this.client.get(`/admin/subtitles/video/${videoId}`);
  }

  getEpisodeSubtitles(episodeId: string) {
    return this.client.get(`/admin/subtitles/episode/${episodeId}`);
  }

  getSubtitle(id: string) {
    return this.client.get(`/admin/subtitles/${id}`);
  }

  uploadSubtitle(episodeId: string, data: { language: string; content: string; label?: string; isAuto?: boolean }) {
    return this.client.post(`/admin/subtitles/episode/${episodeId}/upload`, data);
  }

  bulkUploadSubtitles(videoId: string, mappings: Array<{ episodeId: string; language: string; content: string }>) {
    return this.client.post(`/admin/subtitles/video/${videoId}/bulk-upload`, { mappings });
  }

  generateSubtitle(episodeId: string, data: { targetLanguage: string; sourceLanguage?: string; label?: string }) {
    return this.client.post(`/admin/subtitles/episode/${episodeId}/generate`, data);
  }

  updateSubtitleContent(id: string, content: string) {
    return this.client.patch(`/admin/subtitles/${id}`, { content });
  }

  deleteSubtitle(id: string) {
    return this.client.delete(`/admin/subtitles/${id}`);
  }

  // Settings
  getSettings() {
    return this.client.get('/admin/settings');
  }

  updateSettings(data: Record<string, unknown>) {
    return this.client.patch('/admin/settings', data);
  }

  getAdminUsers(params?: Record<string, unknown>) {
    return this.client.get('/admin/users/admins', { params });
  }

  getUploadUrl(filename: string, contentType: string) {
    return this.client.post('/admin/upload/presigned-url', { filename, contentType });
  }

  // ===== Gamification =====

  // Overview
  getGamificationOverview() {
    return this.client.get('/admin/gamification/overview');
  }

  // Daily Tasks
  getDailyTasks(params?: Record<string, unknown>) {
    return this.client.get('/admin/gamification/daily-tasks', { params: sanitizeParams(params) });
  }

  getDailyTask(id: string) {
    return this.client.get(`/admin/gamification/daily-tasks/${id}`);
  }

  getDailyTaskStats() {
    return this.client.get('/admin/gamification/daily-tasks/stats');
  }

  createDailyTask(data: Record<string, unknown>) {
    return this.client.post('/admin/gamification/daily-tasks', data);
  }

  updateDailyTask(id: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/gamification/daily-tasks/${id}`, data);
  }

  deleteDailyTask(id: string) {
    return this.client.delete(`/admin/gamification/daily-tasks/${id}`);
  }

  toggleDailyTask(id: string) {
    return this.client.post(`/admin/gamification/daily-tasks/${id}/toggle`);
  }

  reorderDailyTasks(taskIds: string[]) {
    return this.client.post('/admin/gamification/daily-tasks/reorder', { taskIds });
  }

  // Achievements
  getAchievements(params?: Record<string, unknown>) {
    return this.client.get('/admin/gamification/achievements', { params: sanitizeParams(params) });
  }

  getAchievement(id: string) {
    return this.client.get(`/admin/gamification/achievements/${id}`);
  }

  getAchievementStats() {
    return this.client.get('/admin/gamification/achievements/stats');
  }

  createAchievement(data: Record<string, unknown>) {
    return this.client.post('/admin/gamification/achievements', data);
  }

  updateAchievement(id: string, data: Record<string, unknown>) {
    return this.client.patch(`/admin/gamification/achievements/${id}`, data);
  }

  deleteAchievement(id: string) {
    return this.client.delete(`/admin/gamification/achievements/${id}`);
  }

  toggleAchievement(id: string) {
    return this.client.post(`/admin/gamification/achievements/${id}/toggle`);
  }

  // Check-in Rewards
  getCheckInRewards() {
    return this.client.get('/admin/gamification/check-in-rewards');
  }

  getCheckInStats() {
    return this.client.get('/admin/gamification/check-in-rewards/stats');
  }

  updateCheckInReward(data: Record<string, unknown>) {
    return this.client.patch('/admin/gamification/check-in-rewards', data);
  }

  bulkUpdateCheckInRewards(rewards: Record<string, unknown>[]) {
    return this.client.post('/admin/gamification/check-in-rewards/bulk', { rewards });
  }
}

export const adminAPI = new AdminAPI();
export default adminAPI;

