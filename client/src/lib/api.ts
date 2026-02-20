import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(auth = false): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (auth) {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  private async handle<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) {
        try {
          await useAuthStore.getState().refreshAccessToken();
        } catch {
          /* ignore */
        }
      }
      throw new Error(body.message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async get<T>(path: string, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.getHeaders(auth) });
    return this.handle<T>(res);
  }

  async post<T>(path: string, data?: unknown, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(auth),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handle<T>(res);
  }

  async put<T>(path: string, data?: unknown, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(auth),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handle<T>(res);
  }

  async patch<T>(path: string, data?: unknown, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(auth),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handle<T>(res);
  }

  async delete<T>(path: string, auth = false): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(auth),
    });
    return this.handle<T>(res);
  }
}

export const api = new ApiClient(API_BASE_URL);

// ─── Video API helpers ──────────────────────────────────────

export interface PaginatedVideos {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const videoApi = {
  /** Danh sách video (public) */
  list: (params?: Record<string, string | number>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return api.get<PaginatedVideos>(`/videos${qs}`);
  },

  /** Video trending */
  trending: (limit = 12) => api.get<any[]>(`/videos/trending?limit=${limit}`),

  /** Video mới */
  newReleases: (limit = 12) => api.get<any[]>(`/videos/new-releases?limit=${limit}`),

  /** Danh sách thể loại */
  genres: () => api.get<{ id: string; name: string; slug: string; description?: string }[]>('/videos/genres'),

  /** Danh sách video theo thể loại */
  byGenre: (genre: string, limit = 12) =>
    api.get<PaginatedVideos>(`/videos?genre=${encodeURIComponent(genre)}&limit=${limit}&status=PUBLISHED`),

  /** Chi tiết video */
  detail: (id: string) => api.get<any>(`/videos/${id}`),

  /** Chi tiết theo slug */
  bySlug: (slug: string) => api.get<any>(`/videos/slug/${slug}`),

  /** Tăng lượt xem */
  incrementView: (id: string) => api.post(`/videos/${id}/view`),

  /** Kiểm tra quyền truy cập episode */
  checkAccess: (episodeId: string) => api.get<any>(`/videos/episodes/${episodeId}/access`, true),

  /** Lấy streaming URL */
  getStreamUrl: (episodeId: string) => api.get<any>(`/videos/episodes/${episodeId}/stream`, true),

  /** Cập nhật tiến trình xem */
  updateProgress: (videoId: string, data: { episodeId?: string; progressive: number }) =>
    api.post(`/videos/${videoId}/watch-progress`, data, true),
};

// ─── Watch History API helpers ────────────────────────────

export const watchHistoryApi = {
  /** Lịch sử xem (tiếp tục xem) */
  list: (page = 1, limit = 12) =>
    api.get<any>(`/users/watch-history?page=${page}&limit=${limit}`, true),
};

// ─── Search API helpers ──────────────────────────────────────

export const searchApi = {
  /** Tìm kiếm video */
  search: (q: string, page = 1, limit = 20) =>
    api.get<any>(`/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),

  /** Gợi ý tìm kiếm (autocomplete) */
  suggest: (q: string, limit = 8) =>
    api.get<any>(`/search/suggest?q=${encodeURIComponent(q)}&limit=${limit}`),
};

// ─── Banners API helpers ─────────────────────────────────────

export const bannerApi = {
  /** Lấy danh sách banners cho trang chủ */
  list: (limit = 10) => api.get<any>(`/client/banners?limit=${limit}`),
};

// ─── Recommendations API helpers ─────────────────────────────

export const recommendApi = {
  /** Gợi ý cho user đã đăng nhập */
  forUser: (limit = 20) => api.get<any[]>(`/recommendations?limit=${limit}`, true),

  /** Video tương tự */
  similar: (videoId: string, limit = 10) =>
    api.get<any[]>(`/recommendations/similar/${videoId}?limit=${limit}`),
};

// ─── Likes API helpers ───────────────────────────────────────

export const likesApi = {
  /** Toggle yêu thích */
  toggle: (videoId: string) => api.post<{ liked: boolean }>(`/likes/toggle/${videoId}`, undefined, true),

  /** Kiểm tra đã thích chưa */
  check: (videoId: string) => api.get<{ liked: boolean }>(`/likes/check/${videoId}`, true),

  /** Danh sách yêu thích */
  list: (page = 1, limit = 20) => api.get<any>(`/likes?page=${page}&limit=${limit}`, true),
};

// ─── Ratings API helpers ─────────────────────────────────────

export const ratingsApi = {
  /** Đánh giá video */
  rate: (videoId: string, rating: number, review?: string) =>
    api.post<any>(`/ratings/${videoId}`, { rating, review }, true),

  /** Đánh giá của tôi */
  myRating: (videoId: string) => api.get<any>(`/ratings/me/${videoId}`, true),

  /** Đánh giá của video */
  videoRatings: (videoId: string, page = 1) =>
    api.get<any>(`/ratings/video/${videoId}?page=${page}`),
};

// ─── Comments API helpers ────────────────────────────────────

export const commentsApi = {
  /** Lấy bình luận theo video */
  byVideo: (videoId: string, page = 1, limit = 20) =>
    api.get<any>(`/comments/video/${videoId}?page=${page}&limit=${limit}`),

  /** Lấy phản hồi */
  replies: (commentId: string, page = 1, limit = 10) =>
    api.get<any>(`/comments/${commentId}/replies?page=${page}&limit=${limit}`),

  /** Tạo bình luận */
  create: (data: { videoId: string; content: string; parentId?: string }) =>
    api.post<any>('/comments', data, true),

  /** Sửa bình luận */
  update: (id: string, data: { content: string }) =>
    api.put<any>(`/comments/${id}`, data, true),

  /** Xóa bình luận */
  delete: (id: string) => api.delete<any>(`/comments/${id}`, true),

  /** Báo cáo bình luận */
  report: (id: string) => api.post<any>(`/comments/${id}/report`, undefined, true),
};

// ─── Wallet API helpers ──────────────────────────────────────

export interface GoldPackageResponse {
  id: string;
  gold: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  name: string;
  description?: string;
}

export const walletApi = {
  /** Lấy số dư ví */
  getBalance: () =>
    api.get<{ goldBalance: number; vipTier: string | null; vipExpiresAt: string | null }>(
      '/wallet/balance',
      true,
    ),

  /** Lấy danh sách gói nạp Gold từ database */
  getGoldPackages: () =>
    api.get<GoldPackageResponse[]>('/wallet/gold-packages'),
};

// ─── VIP API helpers ─────────────────────────────────────────

export interface VipPlan {
  id: string;
  type: 'VIP_FREEADS' | 'VIP_GOLD';
  days: number;
  price: number;
  goldPrice: number;
  name: string;
  discount: number | null;
}

export interface VipStatus {
  vipTier: string | null;
  vipExpiresAt: string | null;
  isActive: boolean;
}

export const vipApi = {
  /** Danh sách gói VIP */
  getPlans: () => api.get<VipPlan[]>('/vip/plans'),

  /** Trạng thái VIP hiện tại */
  getStatus: () => api.get<VipStatus>('/vip/status', true),
};

// ─── Payment API helpers ─────────────────────────────────────

export interface CreatePaymentParams {
  type: string; // TransactionType enum
  amount: number;
  goldAmount?: number;
  vipDays?: number;
  provider: 'VNPAY' | 'MOMO';
  description?: string;
}

export interface PaymentResult {
  transactionId: string;
  paymentUrl: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  rewardValue: number | null;
  provider: string | null;
  description: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  processedAt: string | null;
}

export const paymentApi = {
  /** Tạo thanh toán */
  create: (data: CreatePaymentParams) =>
    api.post<PaymentResult>('/payment/create', data, true),

  /** Lịch sử giao dịch */
  history: (page = 1, limit = 20) =>
    api.get<{ data: Transaction[]; pagination: any }>(
      `/payment/history?page=${page}&limit=${limit}`,
      true,
    ),
};

// ─── Unlock API helpers ──────────────────────────────────────

export interface AccessCheck {
  hasAccess: boolean;
  method?: string;
  unlockPrice?: number;
}

export const unlockApi = {
  /** Kiểm tra quyền truy cập tập phim */
  checkAccess: (episodeId: string) =>
    api.get<AccessCheck>(`/unlock/check/${episodeId}`, true),

  /** Mở khóa bằng gold */
  unlockWithGold: (episodeId: string) =>
    api.post<{ success: boolean; goldSpent: number }>(`/unlock/gold/${episodeId}`, undefined, true),
};

// ─── Gamification API ─────────────────────────────────────────
import type {
  CheckInStatus,
  CheckInRecord,
  CheckInResult,
  DailyTaskStatus,
  WatchTrackResult,
  Achievement,
} from '@/types/gamification';

export const checkInApi = {
  /** Điểm danh hôm nay */
  checkIn: () =>
    api.post<CheckInResult>('/gamification/check-in', undefined, true),

  /** Trạng thái điểm danh */
  getStatus: () =>
    api.get<CheckInStatus>('/gamification/check-in/status', true),

  /** Lịch sử điểm danh 30 ngày */
  getHistory: () =>
    api.get<CheckInRecord[]>('/gamification/check-in/history', true),

  /** Lấy cấu hình phần thưởng điểm danh từ database */
  getRewards: () =>
    api.get<{ id: string; day: number; rewardGold: number; description?: string }[]>('/gamification/check-in/rewards', true),
};

export const dailyTasksApi = {
  /** Danh sách nhiệm vụ hàng ngày + tiến độ */
  getTasks: () =>
    api.get<{ tasks: DailyTaskStatus[] }>('/gamification/tasks', true),

  /** Ghi nhận sự kiện xem tập phim */
  trackWatch: () =>
    api.post<WatchTrackResult>('/gamification/tasks/watch', undefined, true),
};

export const achievementsApi = {
  /** Danh sách thành tích */
  getAll: () =>
    api.get<Achievement[]>('/gamification/achievements', true),
};

// ─── Bookmarks (Favorites) API helpers ───────────────────────

export const bookmarksApi = {
  /** Danh sách đánh dấu (yêu thích) */
  list: (page = 1, limit = 20) =>
    api.get<any>(`/likes?page=${page}&limit=${limit}`, true),

  /** Toggle đánh dấu */
  toggle: (videoId: string) =>
    api.post<{ liked: boolean }>(`/likes/toggle/${videoId}`, undefined, true),

  /** Kiểm tra đã đánh dấu chưa */
  check: (videoId: string) =>
    api.get<{ liked: boolean }>(`/likes/check/${videoId}`, true),
};

// ─── User Profile / Settings API helpers ─────────────────────

export const userApi = {
  /** Lấy profile */
  getProfile: () => api.get<any>('/users/profile', true),

  /** Cập nhật profile */
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

  /** Thống kê cá nhân */
  getStats: () => api.get<any>('/users/stats', true),
};
