import { apiClient } from './client';

export const vipAPI = {
  getVipPlans() {
    return apiClient.get('/admin/vip-plans');
  },

  updateVipPlanPrice(id: string, priceVnd: number) {
    return apiClient.patch(`/admin/vip-plans/${id}`, { priceVnd });
  },
};
