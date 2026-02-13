import { PayoutStatus } from '@prisma/client';

export interface AffiliateWithdrawalEntity {
  id: string;
  affiliateId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  status: PayoutStatus;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
