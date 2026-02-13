import { VipType, Gender } from '@prisma/client';

export interface UserEntity {
  id: string;
  email: string;
  nickname: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  vipType: VipType;
  vipExpiresAt?: Date;
  goldBalance: number;
  isEmailVerified: boolean;
  isActive: boolean;
  isLocked: boolean;
  lockReason?: string;
  country?: string;
  language: string;
  googleId?: string;
  facebookId?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
