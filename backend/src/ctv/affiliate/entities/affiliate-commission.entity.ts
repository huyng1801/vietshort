export interface AffiliateCommissionEntity {
  affiliateId: string;
  userId: string;
  transactionId: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  createdAt: Date;
}
