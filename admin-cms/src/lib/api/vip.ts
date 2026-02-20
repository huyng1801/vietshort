import { apiClient } from './client';

export const vipAPI = {
  getVipPlans() {
    return apiClient.get('/admin/vip-plans');
  },

  updateVipPlanPrice(id: string, priceVnd: number) {
    return apiClient.patch(`/admin/vip-plans/${id}`, { priceVnd });
  },

  // Gold Packages
  getGoldPackages() {
    return apiClient.get('/admin/gold-packages');
  },

  createGoldPackage(data: {
    name: string;
    goldAmount: number;
    bonusGold?: number;
    priceVnd: number;
    isPopular?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    description?: string;
  }) {
    return apiClient.post('/admin/gold-packages', data);
  },

  updateGoldPackage(id: string, data: Record<string, unknown>) {
    return apiClient.patch(`/admin/gold-packages/${id}`, data);
  },

  deleteGoldPackage(id: string) {
    return apiClient.delete(`/admin/gold-packages/${id}`);
  },
};
