import { apiClient, sanitizeParams } from './client';

export const socialAPI = {
  getSocialOverview() {
    return apiClient.get('/admin/social/overview');
  },

  // Comments
  getComments(params?: Record<string, unknown>) {
    return apiClient.get('/admin/social/comments', { params: sanitizeParams(params) });
  },

  getCommentStats() {
    return apiClient.get('/admin/social/comments/stats');
  },

  getComment(id: string) {
    return apiClient.get(`/admin/social/comments/${id}`);
  },

  moderateComment(id: string, isApproved: boolean) {
    return apiClient.post(`/admin/social/comments/${id}/moderate`, { isApproved });
  },

  bulkModerateComments(ids: string[], isApproved: boolean) {
    return apiClient.post('/admin/social/comments/bulk-moderate', { ids, isApproved });
  },

  deleteComment(id: string) {
    return apiClient.delete(`/admin/social/comments/${id}`);
  },

  bulkDeleteComments(ids: string[]) {
    return apiClient.post('/admin/social/comments/bulk-delete', { ids });
  },

  // Ratings
  getRatings(params?: Record<string, unknown>) {
    return apiClient.get('/admin/social/ratings', { params: sanitizeParams(params) });
  },

  getRatingStats() {
    return apiClient.get('/admin/social/ratings/stats');
  },

  getRatingDistribution(videoId?: string) {
    return apiClient.get('/admin/social/ratings/distribution', { params: videoId ? { videoId } : {} });
  },

  deleteRating(id: string) {
    return apiClient.delete(`/admin/social/ratings/${id}`);
  },

  // Favorites
  getFavoriteStats(params?: Record<string, unknown>) {
    return apiClient.get('/admin/social/favorites', { params: sanitizeParams(params) });
  },

  getVideoFavorites(videoId: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/social/favorites/video/${videoId}`, { params: sanitizeParams(params) });
  },

  // Likes
  getLikeStats(params?: Record<string, unknown>) {
    return apiClient.get('/admin/social/likes', { params: sanitizeParams(params) });
  },

  getVideoLikes(videoId: string, params?: Record<string, unknown>) {
    return apiClient.get(`/admin/social/likes/video/${videoId}`, { params: sanitizeParams(params) });
  },
};
