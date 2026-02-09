// Prisma model: CtvAffiliate
export interface AffiliateEntity {
  id: string;
  email: string;
  nickname: string;
  passwordHash: string;
  realName?: string;
  phone?: string;
  bankAccount?: string;
  bankName?: string;
  referralCode: string;
  referralUrl: string;
  commissionRate: number;
  totalEarned: number;
  pendingPayout: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
