// ===== CTV / Affiliate Types =====

export type AffiliateType = 'TIER1' | 'TIER2' | 'TIER3' | 'COMPANY' | 'INDIVIDUAL';
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface Affiliate {
  id: string;
  userId: string;
  affiliateType: AffiliateType;
  tier?: number;
  commissionRate: number;
  parentAffiliateId?: string;
  totalEarnings: number;
  totalEarned?: number;
  pendingPayout: number;
  totalPaidOut: number;
  paidOut?: number;
  isActive: boolean;
  isVerified?: boolean;
  referralCount: number;
  referralCode?: string;
  referralUrl?: string;
  companyName?: string;
  realName?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  bankName?: string;
  bankAccount?: string;
  contractStartAt?: string;
  contractEndAt?: string;
  contractNotes?: string;
  totalClicks?: number;
  totalRegistrations?: number;
  totalPurchasers?: number;
  networkMembers?: number;
  networkEarned?: number;
  _count?: Record<string, number>;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  parent?: Affiliate;
  parentAffiliate?: {
    id: string;
    user: { firstName?: string; lastName?: string; email: string };
  };
  children?: Affiliate[];
  createdAt: string;
  updatedAt: string;
}

export interface NetworkStats {
  totalAffiliates: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  totalEarnings: number;
  totalPaidOut: number;
  pendingPayouts: number;
}

export interface CtvReferral {
  id: string;
  referrerId: string;
  referredUserId: string;
  commission: number;
  isPaid: boolean;
  user?: { id: string; email: string; firstName?: string; lastName?: string; avatar?: string; nickname?: string; };
  userId?: string;
  referrer: {
    user: { firstName?: string; lastName?: string; email: string };
  };
  referredUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface CtvPayout {
  id: string;
  affiliateId: string;
  amount: number;
  status: PayoutStatus;
  paymentMethod?: string;
  paymentDetails?: string;
  processedAt?: string;
  processedBy?: string;
  note?: string;
  affiliate: {
    user: { firstName?: string; lastName?: string; email: string };
    realName?: string;
    nickname?: string;
  };
  createdAt: string;
  updatedAt: string;
}
