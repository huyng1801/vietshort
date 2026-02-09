export interface CodeBatchEntity {
  batchName: string;
  totalCodes: number;
  usedCodes: number;
  rewardType: string;
  goldValue: number;
  vipDays?: number;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface CodeUsageLog {
  codeId: string;
  userId: string;
  usedAt: Date;
  ipAddress?: string;
  deviceInfo?: string;
}
