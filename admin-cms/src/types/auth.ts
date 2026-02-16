// ===== Auth / Admin User Types =====

export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  role: AdminRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  permissions?: string[];
  lastLoginAt?: string;
  createdAt?: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'MODERATOR';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}
