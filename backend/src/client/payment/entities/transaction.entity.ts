import { TransactionType, TransactionStatus, PaymentProvider } from '@prisma/client';

export interface TransactionEntity {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  goldAmount: number;
  vipDays?: number;
  provider: PaymentProvider;
  providerTxId?: string;
  status: TransactionStatus;
  description?: string;
  referenceId?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
