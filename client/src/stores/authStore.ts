import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export type VipType = 'VIP_FREEADS' | 'VIP_GOLD';

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  birthYear?: number;
  vipTier?: VipType | null;
  vipExpiresAt?: string | null;
  goldBalance: number;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Auth actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  guestLogin: (deviceId?: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  
  // OAuth
  loginWithOAuth: (provider: 'google' | 'facebook' | 'apple' | 'tiktok') => Promise<void>;
  handleOAuthCallback: (provider: string, code: string) => Promise<void>;
  
  // Token management
  refreshAccessToken: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  
  // User management
  updateUser: (data: Partial<User>) => void;
  setUser: (user: User | null) => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  nickname: string;
  birthYear: number;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Login
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Đăng nhập thất bại');
          }

          const { user, accessToken, refreshToken } = await response.json();
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Đăng nhập thất bại' 
          });
          throw error;
        }
      },

      // Register
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Đăng ký thất bại');
          }

          const { user, accessToken, refreshToken } = await response.json();
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Đăng ký thất bại' 
          });
          throw error;
        }
      },

      // Guest login
      guestLogin: async (deviceId?: string, referralCode?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Generate or use provided device ID
          const finalDeviceId = deviceId || 
            localStorage.getItem('vietshort-device-id') || 
            crypto.randomUUID();
          
          // Store device ID for future use
          localStorage.setItem('vietshort-device-id', finalDeviceId);
          
          const response = await fetch(`${API_BASE_URL}/auth/guest/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: finalDeviceId, referralCode }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Guest login failed');
          }

          const { user, accessToken, refreshToken } = await response.json();
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Guest login failed';
          console.error('Guest login error:', errorMessage);
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          const { accessToken } = get();
          if (accessToken) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ ...initialState });
        }
      },

      // Forgot Password
      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể gửi email đặt lại mật khẩu');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Lỗi không xác định' 
          });
          throw error;
        }
      },

      // Reset Password
      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Đặt lại mật khẩu thất bại');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Lỗi không xác định' 
          });
          throw error;
        }
      },

      // OAuth Login (redirect to provider)
      loginWithOAuth: async (provider: 'google' | 'facebook' | 'apple' | 'tiktok') => {
        // Redirect to OAuth provider
        window.location.href = `${API_BASE_URL}/auth/oauth/${provider}`;
      },

      // Handle OAuth callback
      handleOAuthCallback: async (provider: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/oauth/${provider}/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'OAuth authentication failed');
          }

          const { user, accessToken, refreshToken } = await response.json();
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'OAuth authentication failed' 
          });
          throw error;
        }
      },

      // Refresh access token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ ...initialState });
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();
          
          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
          console.error('Token refresh error:', error);
          set({ ...initialState });
        }
      },

      // Set tokens manually
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      // Update user data
      updateUser: (data: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },

      // Set user
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      // Loading state
      setLoading: (isLoading: boolean) => set({ isLoading }),

      // Error handling
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // Reset store
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'vietshort-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);