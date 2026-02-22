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

  private async handleWithRetry<T>(
    res: Response,
    retryFn?: () => Promise<Response>,
  ): Promise<T> {
    if (!res.ok) {
      if (res.status === 401 && retryFn) {
        try {
          await useAuthStore.getState().refreshAccessToken();
          const { accessToken } = useAuthStore.getState();
          if (accessToken) {
            const retryRes = await retryFn();
            if (retryRes.ok) return retryRes.json() as Promise<T>;
            const retryBody = await retryRes.json().catch(() => ({}));
            throw new Error(retryBody.message || `HTTP ${retryRes.status}`);
          }
        } catch {
          // Refresh failed — fall through to throw original error
        }
      }
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async get<T>(path: string, auth = false): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, { headers: this.getHeaders(auth) });
    return this.handleWithRetry<T>(
      res,
      auth ? () => fetch(url, { headers: this.getHeaders(true) }) : undefined,
    );
  }

  async post<T>(path: string, data?: unknown, auth = false): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const opts = () => ({
      method: 'POST' as const,
      headers: this.getHeaders(auth),
      body: data ? JSON.stringify(data) : undefined,
    });
    const res = await fetch(url, opts());
    return this.handleWithRetry<T>(
      res,
      auth ? () => fetch(url, { ...opts(), headers: this.getHeaders(true) }) : undefined,
    );
  }

  async put<T>(path: string, data?: unknown, auth = false): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const opts = () => ({
      method: 'PUT' as const,
      headers: this.getHeaders(auth),
      body: data ? JSON.stringify(data) : undefined,
    });
    const res = await fetch(url, opts());
    return this.handleWithRetry<T>(
      res,
      auth ? () => fetch(url, { ...opts(), headers: this.getHeaders(true) }) : undefined,
    );
  }

  async patch<T>(path: string, data?: unknown, auth = false): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const opts = () => ({
      method: 'PATCH' as const,
      headers: this.getHeaders(auth),
      body: data ? JSON.stringify(data) : undefined,
    });
    const res = await fetch(url, opts());
    return this.handleWithRetry<T>(
      res,
      auth ? () => fetch(url, { ...opts(), headers: this.getHeaders(true) }) : undefined,
    );
  }

  async delete<T>(path: string, auth = false): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, { method: 'DELETE', headers: this.getHeaders(auth) });
    return this.handleWithRetry<T>(
      res,
      auth ? () => fetch(url, { method: 'DELETE', headers: this.getHeaders(true) }) : undefined,
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
