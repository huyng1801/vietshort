import { VipType } from '@prisma/client';

export interface VipSubscriptionEntity {
  userId: string;
  vipTier: VipType | null;
  startDate: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface VipPlan {
  id: string;
  name: string;
  type: VipType;
  days: number;
  price: number;
  goldPrice: number;
  features: string[];
}

export const VIP_PLANS: VipPlan[] = [
  { id: 'freeads_30', name: 'VIP FreeAds 30 ngày', type: 'VIP_FREEADS' as VipType, days: 30, price: 19000, goldPrice: 190, features: ['Xem không quảng cáo'] },
  { id: 'freeads_90', name: 'VIP FreeAds 90 ngày', type: 'VIP_FREEADS' as VipType, days: 90, price: 49000, goldPrice: 490, features: ['Xem không quảng cáo', 'Tiết kiệm 14%'] },
  { id: 'freeads_365', name: 'VIP FreeAds 1 năm', type: 'VIP_FREEADS' as VipType, days: 365, price: 179000, goldPrice: 1790, features: ['Xem không quảng cáo', 'Tiết kiệm 22%'] },
  { id: 'gold_30', name: 'VIP Gold 30 ngày', type: 'VIP_GOLD' as VipType, days: 30, price: 49000, goldPrice: 490, features: ['Xem không quảng cáo', 'Chất lượng 1080p', 'Phim độc quyền'] },
  { id: 'gold_90', name: 'VIP Gold 90 ngày', type: 'VIP_GOLD' as VipType, days: 90, price: 129000, goldPrice: 1290, features: ['Tất cả Gold', 'Tiết kiệm 12%'] },
  { id: 'gold_365', name: 'VIP Gold 1 năm', type: 'VIP_GOLD' as VipType, days: 365, price: 469000, goldPrice: 4690, features: ['Tất cả Gold', 'Tiết kiệm 20%'] },
];
