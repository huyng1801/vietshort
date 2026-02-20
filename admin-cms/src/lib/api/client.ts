import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Backend admin API is served on 3000 in dev/test env; allow override via env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

// Helper: Sanitize params for API requests
export const sanitizeParams = (params?: Record<string, unknown>): Record<string, unknown> => {
  if (!params) return {};

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip undefined and null values
    if (value === undefined || value === null) continue;

    // Convert page and limit to integers
    if (key === 'page' || key === 'limit') {
      const num = parseInt(String(value), 10);
      if (!isNaN(num) && num >= 1) {
        sanitized[key] = num;
      }
    } else if (typeof value === 'string' && value.trim()) {
      // Only include non-empty strings
      sanitized[key] = value;
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      // Include booleans and numbers
      sanitized[key] = value;
    } else if (value instanceof Date) {
      // Convert Date objects to ISO string
      sanitized[key] = value.toISOString().split('T')[0];
    } else if (typeof value === 'object' && value !== null && 'toISOString' in value) {
      // Handle Dayjs objects that have toISOString method
      try {
        const isoString = (value as any).toISOString();
        sanitized[key] = isoString.split('T')[0];
      } catch {
        // If conversion fails, try toString()
        const strValue = String(value).trim();
        if (strValue) {
          sanitized[key] = strValue;
        }
      }
    }
  }

  return sanitized;
};

function createApiClient(): AxiosInstance {
  console.log('🔧 AdminAPI - Final URL:', API_URL);

  const client = axios.create({
    baseURL: `${API_URL}/api/v1`,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      console.log('🔐 Interceptor - Found token:', token ? 'YES' : 'NO');
      if (token) {
        console.log('🔗 Adding Bearer token to headers');
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (refreshToken) {
          try {
            const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });
            localStorage.setItem('admin_token', res.data.data.accessToken);
            error.config.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            return client(error.config);
          } catch {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_refresh_token');
            window.location.href = '/login';
          }
        } else {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const apiClient = createApiClient();
