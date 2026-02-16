import { PrismaClient, RewardType } from '@prisma/client';

export async function seedExchangeCodes(prisma: PrismaClient) {
  console.log('🎟️  Creating code batches and exchange codes...');

  // ═══════════════════════════════════════════════════════════
  // CODE BATCHES
  // ═══════════════════════════════════════════════════════════
  const batches = [
    {
      id: 'batch_welcome_2024',
      batchName: 'Welcome Pack 2024',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      quantity: 3,
      usageLimit: 1,
      codeLength: 10,
      codePrefix: 'WLC',
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      id: 'batch_vip_trial',
      batchName: 'VIP Trial Pack',
      rewardType: RewardType.VIP_DAYS,
      rewardValue: 7,
      quantity: 2,
      usageLimit: 1,
      codeLength: 8,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      id: 'batch_tet_2025',
      batchName: 'Tết 2025 Event',
      rewardType: RewardType.GOLD,
      rewardValue: 200,
      quantity: 2,
      usageLimit: 1,
      codeLength: 11,
      codePrefix: 'TET',
      isActive: true,
      expiresAt: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
  ];

  for (const batch of batches) {
    await prisma.codeBatch.upsert({
      where: { batchName: batch.batchName },
      update: {},
      create: batch,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // EXCHANGE CODES
  // ═══════════════════════════════════════════════════════════
  const exchangeCodes = [
    {
      code: 'WELCOME100',
      batchId: 'batch_welcome_2024',
      batchName: 'Welcome Pack 2024',
      description: 'Mã chào mừng người dùng mới - 100 vàng',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 10,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'WLC_GOLD200',
      batchId: 'batch_welcome_2024',
      batchName: 'Welcome Pack 2024',
      description: 'Welcome code 2',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'WLC_GOLD300',
      batchId: 'batch_welcome_2024',
      batchName: 'Welcome Pack 2024',
      description: 'Welcome code 3',
      rewardType: RewardType.GOLD,
      rewardValue: 100,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'VIP7DAYS',
      batchId: 'batch_vip_trial',
      batchName: 'VIP Trial Pack',
      description: 'Dùng thử VIP Gold 7 ngày miễn phí',
      rewardType: RewardType.VIP_DAYS,
      rewardValue: 7,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 8,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'VIP3TRIAL',
      batchId: 'batch_vip_trial',
      batchName: 'VIP Trial Pack',
      description: 'Dùng thử VIP Gold 3 ngày',
      rewardType: RewardType.VIP_DAYS,
      rewardValue: 7,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 9,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'NEWYEAR2025',
      batchId: 'batch_tet_2025',
      batchName: 'Tết 2025 Event',
      description: 'Mã Tết 2025 - 200 vàng',
      rewardType: RewardType.GOLD,
      rewardValue: 200,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
    {
      code: 'TET_GOLD500',
      batchId: 'batch_tet_2025',
      batchName: 'Tết 2025 Event',
      description: 'Mã Tết 500 vàng',
      rewardType: RewardType.GOLD,
      rewardValue: 200,
      usageLimit: 1,
      usedCount: 0,
      codeLength: 11,
      isActive: true,
      expiresAt: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000),
      createdBy: 'superadmin@vietshort.com',
    },
  ];

  for (const code of exchangeCodes) {
    await prisma.exchangeCode.upsert({
      where: { code: code.code },
      update: code,
      create: code,
    });
  }

  console.log('✅ Code batches and exchange codes created\n');
}
