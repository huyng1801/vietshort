// ─── Payment & VIP Types ────────────────────────────────────

export type TransactionType =
  | 'BUY_GOLD'
  | 'SPEND_GOLD'
  | 'PURCHASE_VIP'
  | 'UNLOCK_EPISODE'
  | 'ADMIN_ADJUST'
  | 'CHECKIN_REWARD'
  | 'DAILY_TASK_REWARD'
  | 'AD_REWARD'
  | 'REFUND'
  | 'CTV_COMMISSION';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'IAP_GOOGLE' | 'IAP_APPLE';
export type UnlockMethod = 'GOLD' | 'VIP' | 'AD_REWARD';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  rewardValue: number | null;
  provider: PaymentProvider | null;
  providerTxId: string | null;
  description: string | null;
  status: TransactionStatus;
  createdAt: string;
  processedAt: string | null;
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
  vipTier: 'VIP_FREEADS' | 'VIP_GOLD' | null;
  vipExpiresAt: string | null;
  isActive: boolean;
}

export interface GoldPackage {
  id: string;
  gold: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  name?: string;
  description?: string;
}

// Fallback gold packages (used only when API is unavailable)
export const GOLD_PACKAGES_FALLBACK: GoldPackage[] = [
  { id: 'gold_50', gold: 50, price: 10000 },
  { id: 'gold_100', gold: 100, price: 19000 },
  { id: 'gold_300', gold: 300, price: 49000, bonus: 30, popular: true },
  { id: 'gold_500', gold: 500, price: 79000, bonus: 60 },
  { id: 'gold_1000', gold: 1000, price: 149000, bonus: 150 },
  { id: 'gold_3000', gold: 3000, price: 399000, bonus: 500 },
];
