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
