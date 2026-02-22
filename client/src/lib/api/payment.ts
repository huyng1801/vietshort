import { api } from './client';

// ─── Types ────────────────────────────────────────────────────

export interface GoldPackageResponse {
  id: string;
  gold: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  name: string;
  description?: string;
}

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

export interface CreatePaymentParams {
  type: string;
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

export interface AccessCheck {
  hasAccess: boolean;
  method?: string;
  unlockPrice?: number;
}

// ─── API helpers ──────────────────────────────────────────────

export const walletApi = {
  getBalance: () =>
    api.get<{ goldBalance: number; vipTier: string | null; vipExpiresAt: string | null }>(
      '/wallet/balance',
      true,
    ),
  getGoldPackages: () => api.get<GoldPackageResponse[]>('/wallet/gold-packages'),
};

export const vipApi = {
  getPlans: () => api.get<VipPlan[]>('/vip/plans'),
  getStatus: () => api.get<VipStatus>('/vip/status', true),
};

export const paymentApi = {
  create: (data: CreatePaymentParams) =>
    api.post<PaymentResult>('/payment/create', data, true),
  history: (page = 1, limit = 20) =>
    api.get<{ data: Transaction[]; pagination: any }>(
      `/payment/history?page=${page}&limit=${limit}`,
      true,
    ),
};

export const unlockApi = {
  checkAccess: (episodeId: string) =>
    api.get<AccessCheck>(`/unlock/check/${episodeId}`, true),
  unlockWithGold: (episodeId: string) =>
    api.post<{ success: boolean; goldSpent: number }>(`/unlock/gold/${episodeId}`, undefined, true),
};
