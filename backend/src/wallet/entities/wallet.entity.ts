export interface WalletEntity {
  userId: string;
  goldBalance: number;
  lastTransactionAt?: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balance: number;
  description: string;
  referenceId?: string;
  createdAt: Date;
}
