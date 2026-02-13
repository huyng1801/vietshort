import { create } from 'zustand';
import { AdminUser } from '@/types/admin';
import { getStoredUser, clearAuth, setStoredUser } from '@/lib/admin-auth';

interface AdminAuthState {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AdminUser) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user: AdminUser) => {
    setStoredUser(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    clearAuth();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: () => {
    const user = getStoredUser();
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    set({
      user,
      isAuthenticated: !!(user && token),
      isLoading: false,
    });
  },
}));
