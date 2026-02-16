import { AdminUser } from '@/types';
import adminAPI from './admin-api';

const TOKEN_KEY = 'admin_token';
const REFRESH_KEY = 'admin_refresh_token';
const USER_KEY = 'admin_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  console.log('💾 Setting tokens - AccessToken:', accessToken);
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AdminUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loginAdmin(email: string, password: string) {
  const res = await adminAPI.login(email, password);
  console.log('🔐 Login Response:', res.data);
  
  const { accessToken, admin } = res.data;
  console.log('🔑 AccessToken:', accessToken);
  console.log('👤 Admin User:', admin);
  
  setTokens(accessToken, '');
  setStoredUser(admin);
  return { user: admin };
}

export function logoutAdmin() {
  clearAuth();
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  const token = getToken();
  const user = getStoredUser();
  return !!(token && user);
}
