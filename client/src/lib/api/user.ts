import { api } from './client';

export const userApi = {
  getProfile: () => api.get<any>('/users/profile', true),
  updateProfile: (data: {
    nickname?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    avatar?: string;
    country?: string;
    language?: string;
  }) => api.put<any>('/users/profile', data, true),
  getStats: () => api.get<any>('/users/stats', true),
};
