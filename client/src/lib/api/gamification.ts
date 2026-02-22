import { api } from './client';
import type {
  CheckInStatus,
  CheckInRecord,
  CheckInResult,
  DailyTaskStatus,
  WatchTrackResult,
  Achievement,
} from '@/types/gamification';

export const checkInApi = {
  checkIn: () => api.post<CheckInResult>('/gamification/check-in', undefined, true),
  getStatus: () => api.get<CheckInStatus>('/gamification/check-in/status', true),
  getHistory: () => api.get<CheckInRecord[]>('/gamification/check-in/history', true),
  getRewards: () =>
    api.get<{ id: string; day: number; rewardGold: number; description?: string }[]>(
      '/gamification/check-in/rewards',
      true,
    ),
};

export const dailyTasksApi = {
  getTasks: () => api.get<{ tasks: DailyTaskStatus[] }>('/gamification/tasks', true),
  trackWatch: () => api.post<WatchTrackResult>('/gamification/tasks/watch', undefined, true),
};

export const achievementsApi = {
  getAll: () => api.get<Achievement[]>('/gamification/achievements', true),
};
