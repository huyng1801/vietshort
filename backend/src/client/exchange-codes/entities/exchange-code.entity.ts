import { RewardType } from '@prisma/client';

export interface ExchangeCodeEntity {
  id: string;
  code: string;
  batchName?: string;
  rewardType: RewardType;
  goldValue: number;
  vipDays?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: Date;
  createdBy?: string;
  createdAt: Date;
}
