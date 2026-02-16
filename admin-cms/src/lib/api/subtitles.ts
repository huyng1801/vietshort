import { apiClient, sanitizeParams } from './client';

export const subtitlesAPI = {
  getSubtitlesOverview(params?: Record<string, unknown>) {
    return apiClient.get('/admin/subtitles', { params: sanitizeParams(params) });
  },

  getSubtitleQueueStatus() {
    return apiClient.get('/admin/subtitles/queue-status');
  },

  getVideoSubtitles(videoId: string) {
    return apiClient.get(`/admin/subtitles/video/${videoId}`);
  },

  getEpisodeSubtitles(episodeId: string) {
    return apiClient.get(`/admin/subtitles/episode/${episodeId}`);
  },

  getSubtitle(id: string) {
    return apiClient.get(`/admin/subtitles/${id}`);
  },

  uploadSubtitle(episodeId: string, data: { language: string; content: string; label?: string; isAuto?: boolean }) {
    return apiClient.post(`/admin/subtitles/episode/${episodeId}/upload`, data);
  },

  bulkUploadSubtitles(videoId: string, mappings: Array<{ episodeId: string; language: string; content: string }>) {
    return apiClient.post(`/admin/subtitles/video/${videoId}/bulk-upload`, { mappings });
  },

  generateSubtitle(episodeId: string, data: { targetLanguage: string; sourceLanguage?: string; label?: string }) {
    return apiClient.post(`/admin/subtitles/episode/${episodeId}/generate`, data);
  },

  updateSubtitleContent(id: string, content: string) {
    return apiClient.patch(`/admin/subtitles/${id}`, { content });
  },

  deleteSubtitle(id: string) {
    return apiClient.delete(`/admin/subtitles/${id}`);
  },
};
