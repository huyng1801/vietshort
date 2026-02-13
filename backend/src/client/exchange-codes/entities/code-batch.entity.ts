import { RewardType } from '@prisma/client';

export interface CodeBatchEntity {
  id: string;
  batchName: string;
  rewardType: RewardType;
  rewardValue: number;
  quantity: number;
  usageLimit: number;
  codeLength: number;
  codePrefix?: string | null;
  isActive: boolean;
  expiresAt?: Date | null;
  createdBy: string;
  createdAt: Date;
  // Computed fields
  totalCodes?: number;
  usedCodes?: number;
  remainingCodes?: number;
  usagePercentage?: number;
}
