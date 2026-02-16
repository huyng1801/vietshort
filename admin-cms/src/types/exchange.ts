// ===== Exchange Codes Types =====

export interface ExchangeCode {
  id: string;
  code: string;
  batchId?: string;
  goldAmount: number;
  vipDays?: number;
  vipType?: string;
  maxUses: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  batch?: CodeBatch;
  rewardType?: string;
  rewardValue?: number;
  batchName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeBatch {
  id: string;
  name: string;
  batchName?: string;
  description?: string;
  prefix: string;
  totalCodes: number;
  goldAmount: number;
  vipDays?: number;
  vipType?: string;
  maxUsesPerCode: number;
  usageLimit?: number;
  rewardType?: 'GOLD' | 'VIP' | 'MIXED';
  rewardValue?: number;
  usedCodes?: number;
  remainingCodes?: number;
  codeLength?: number;
  codePrefix?: string;
  createdBy?: string;
  usagePercentage?: number;
  expiresAt?: string;
  isActive: boolean;
  _count?: { codes: number };
  usedCount?: number;
  codes?: ExchangeCode[];
  createdAt: string;
  updatedAt: string;
}

export interface CodeRedemption {
  id: string;
  codeId: string;
  userId: string;
  rewardType?: string;
  code: {
    code: string;
    goldAmount: number;
    vipDays?: number;
  };
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  redeemedAt: string;
}
