export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  birthYear: number;
}

export interface AuthResponse {
  user: import('./user').User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface GuestLoginRequest {
  deviceId: string;
  referralCode?: string;
}

export interface GuestLoginResponse extends AuthResponse {
  isGuest: boolean;
}

// Video
export interface GetVideosRequest extends PaginationParams {
  category?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchVideosRequest extends PaginationParams {
  q: string;
  category?: string;
}

// Playback
export interface CreatePlaybackSessionResponse {
  sessionId: string;
  streamUrl: string;
  expiresAt: string;
}

export interface UpdateProgressRequest {
  episodeId: string;
  progress: number;
  duration: number;
}

// Wallet
export interface WalletBalance {
  goldBalance: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: 'GOLD' | 'VND';
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: string;
  returnUrl?: string;
}

export interface DepositResponse {
  transactionId: string;
  paymentUrl: string;
  expiresAt: string;
}

// VIP
export interface VipPackage {
  id: string;
  type: 'VIP_FREEADS' | 'VIP_GOLD';
  name: string;
  price: number;
  duration: number; // days
  discount?: number;
  features: string[];
  recommended?: boolean;
}

export interface SubscribeVipRequest {
  packageId: string;
  paymentMethod: string;
}

export interface SubscribeVipResponse {
  transactionId: string;
  paymentUrl?: string;
}