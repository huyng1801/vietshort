import { apiClient, sanitizeParams } from './client';

export const exchangeCodesAPI = {
  getExchangeCodes(params?: Record<string, unknown>) {
    return apiClient.get('/exchange-codes', { params: sanitizeParams(params) });
  },

  createExchangeCode(data: Record<string, unknown>) {
    return apiClient.post('/exchange-codes', data);
  },

  updateExchangeCode(id: string, data: Record<string, unknown>) {
    return apiClient.put(`/exchange-codes/${id}`, data);
  },

  // Code Batch Management
  getCodeBatches(params?: Record<string, unknown>) {
    return apiClient.get('/exchange-codes/batches', { params: sanitizeParams(params) });
  },

  getCodeBatch(id: string) {
    return apiClient.get(`/exchange-codes/batches/${id}`);
  },

  createCodeBatch(data: Record<string, unknown>) {
    return apiClient.post('/exchange-codes/batches', data);
  },

  getCodeRedemptions(batchId: string, params?: Record<string, unknown>) {
    return apiClient.get(`/exchange-codes/batches/${batchId}/redemptions`, { params: sanitizeParams(params) });
  },

  exportCodes(batchId: string) {
    return apiClient.get(`/exchange-codes/batches/${batchId}/export`, {
      responseType: 'blob',
    });
  },

  deactivateCodeBatch(id: string, reason: string) {
    return apiClient.post(`/exchange-codes/batches/${id}/deactivate`, { reason });
  },
};
