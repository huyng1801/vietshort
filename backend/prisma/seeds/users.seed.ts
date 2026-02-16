import { PrismaClient, VipType, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  console.log('👤 Creating test user accounts...');

  const testUserPassword = await bcrypt.hash('user123456', 12);

  const testUsers = [
    {
      email: 'user1@test.com',
      nickname: 'TestUser1',
      passwordHash: testUserPassword,
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      gender: Gender.MALE,
      vipTier: null,
      goldBalance: 500,
      isEmailVerified: true,
      isActive: true,
      registrationSource: 'web',
      language: 'vi',
    },
    {
      email: 'user2@test.com',
      nickname: 'TestUser2',
      passwordHash: testUserPassword,
      firstName: 'Trần',
      lastName: 'Thị B',
      gender: Gender.FEMALE,
      vipTier: VipType.VIP_FREEADS,
      vipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      goldBalance: 1000,
      isEmailVerified: true,
      isActive: true,
      registrationSource: 'web',
      language: 'vi',
      lastLoginAt: new Date(),
    },
    {
      email: 'user3@test.com',
      nickname: 'TestUser3',
      passwordHash: testUserPassword,
      firstName: 'Lê',
      lastName: 'Văn C',
      gender: Gender.MALE,
      vipTier: VipType.VIP_GOLD,
      vipExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      goldBalance: 2000,
      isEmailVerified: true,
      isActive: true,
      registrationSource: 'android',
      language: 'vi',
      lastLoginAt: new Date(),
    },
    {
      email: 'guest@test.com',
      nickname: 'GuestUser1',
      passwordHash: null,
      firstName: null,
      lastName: null,
      deviceId: 'device_123456789',
      vipTier: null,
      goldBalance: 200,
      isEmailVerified: false,
      isActive: true,
      registrationSource: 'guest',
      language: 'vi',
    },
  ];

  const createdUsers: any[] = [];

  for (const user of testUsers) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
    createdUsers.push(created);
  }

  console.log('✅ Test users created\n');

  return createdUsers;
}
