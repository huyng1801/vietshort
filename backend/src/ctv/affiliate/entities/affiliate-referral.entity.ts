export interface AffiliateReferralEntity {
  id: string;
  affiliateId: string;
  userId: string;
  ipAddress?: string;
  commission: number;
  registeredAt: Date;
  createdAt: Date;
}
