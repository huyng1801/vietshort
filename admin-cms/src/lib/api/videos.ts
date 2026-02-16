import { apiClient, sanitizeParams } from './client';

export const videosAPI = {
  // ═══ Videos (Production Flow) ═══
  getVideos(params: Record<string, unknown>) {
    return apiClient.get('/admin/videos', { params: sanitizeParams(params) });
  },

  getVideo(id: string) {
    return apiClient.get(`/admin/videos/${id}`);
  },

  createVideo(data: Record<string, unknown>) {
    return apiClient.post('/admin/videos', data);
  },

  updateVideo(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/videos/${id}`, data);
  },

  deleteVideo(id: string) {
    return apiClient.delete(`/admin/videos/${id}`);
  },

  publishVideo(id: string) {
    return apiClient.post(`/admin/videos/${id}/publish`);
  },

  unpublishVideo(id: string) {
    return apiClient.post(`/admin/videos/${id}/unpublish`);
  },

  // Poster presigned upload
  getPosterUploadUrl(videoId: string, contentType: string) {
    return apiClient.post(`/admin/videos/${videoId}/poster-upload-url`, { contentType });
  },

  updatePoster(videoId: string, poster: string) {
    return apiClient.patch(`/admin/videos/${videoId}/poster`, { poster });
  },

  // ═══ Episodes ═══
  getEpisodes(videoId: string) {
    return apiClient.get(`/admin/videos/${videoId}/episodes`);
  },

  createEpisode(videoId: string, data: Record<string, unknown>) {
    return apiClient.post(`/admin/videos/${videoId}/episodes`, data);
  },

  getEpisode(episodeId: string) {
    return apiClient.get(`/admin/videos/episodes/${episodeId}`);
  },

  updateEpisode(episodeId: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/videos/episodes/${episodeId}`, data);
  },

  deleteEpisode(episodeId: string) {
    return apiClient.delete(`/admin/videos/episodes/${episodeId}`);
  },

  getEpisodeUploadUrl(episodeId: string, contentType: string) {
    return apiClient.post(`/admin/videos/episodes/${episodeId}/upload-url`, { contentType });
  },

  processEpisode(episodeId: string) {
    return apiClient.post(`/admin/videos/episodes/${episodeId}/process`);
  },

  reprocessEpisode(episodeId: string) {
    return apiClient.post(`/admin/videos/episodes/${episodeId}/reprocess`);
  },

  addEpisodeSubtitle(episodeId: string, data: { language: string; content: string; isAuto?: boolean }) {
    return apiClient.post(`/admin/videos/episodes/${episodeId}/subtitles`, data);
  },

  deleteSubtitleById(subtitleId: string) {
    return apiClient.delete(`/admin/videos/subtitles/${subtitleId}`);
  },

  // Encoding Queue
  getEncodingQueue(params?: Record<string, unknown>) {
    return apiClient.get('/admin/videos/encoding-queue', { params: sanitizeParams(params) });
  },

  getEncodingStats() {
    return apiClient.get('/admin/videos/encoding-stats');
  },
};
