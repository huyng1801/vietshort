import { PrismaClient, PayoutStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedCtvAffiliates(prisma: PrismaClient) {
  console.log('🤝 Creating 3-tier CTV affiliate network...');

  const ctvPassword = await bcrypt.hash('ctv123456', 12);

  // ═══════════════════════════════════════════════════════════
  // TIER 1 - COMPANIES
  // ═══════════════════════════════════════════════════════════
  const company1 = await prisma.ctvAffiliate.upsert({
    where: { email: 'company1@vietmedia.com' },
    update: {},
    create: {
      email: 'company1@vietmedia.com',
      nickname: 'VietMedia',
      passwordHash: ctvPassword,
      companyName: 'VietMedia Marketing Co.',
      realName: 'Nguyễn Văn Công Ty',
      phone: '0901111111',
      bankAccount: '1234567890',
      bankName: 'Vietcombank',
      commissionRate: 0.3,
      referralCode: 'COMPANY01',
      referralUrl: 'https://vietshort.vn/?ref=COMPANY01',
      tier: 1,
      affiliateType: 'COMPANY',
      parentId: null,
      networkMembers: 4,
      networkEarned: 15000000,
      contractNotes: 'Hợp đồng hoa hồng 30% - Phát triển mạng lưới KOC',
      contractStartAt: new Date('2024-01-01'),
      contractEndAt: new Date('2025-12-31'),
      isActive: true,
      isVerified: true,
    },
  });

  const company2 = await prisma.ctvAffiliate.upsert({
    where: { email: 'company2@digitalads.com' },
    update: {},
    create: {
      email: 'company2@digitalads.com',
      nickname: 'DigitalAds',
      passwordHash: ctvPassword,
      companyName: 'Digital Ads Agency Vietnam',
      realName: 'Trần Thị Quảng Cáo',
      phone: '0902222222',
      bankAccount: '0987654321',
      bankName: 'Techcombank',
      commissionRate: 0.3,
      referralCode: 'COMPANY02',
      referralUrl: 'https://vietshort.vn/?ref=COMPANY02',
      tier: 1,
      affiliateType: 'COMPANY',
      parentId: null,
      networkMembers: 3,
      networkEarned: 12000000,
      contractNotes: 'Hợp đồng 30% - Chuyên về quảng cáo số',
      contractStartAt: new Date('2024-02-01'),
      contractEndAt: new Date('2026-01-31'),
      isActive: true,
      isVerified: true,
    },
  });

  const company3 = await prisma.ctvAffiliate.upsert({
    where: { email: 'company3@socialhub.com' },
    update: {},
    create: {
      email: 'company3@socialhub.com',
      nickname: 'SocialHub',
      passwordHash: ctvPassword,
      companyName: 'Social Hub Agency',
      realName: 'Lê Văn Mạng Xã Hội',
      phone: '0903333333',
      bankAccount: '1122334455',
      bankName: 'ACB',
      commissionRate: 0.3,
      referralCode: 'COMPANY03',
      referralUrl: 'https://vietshort.vn/?ref=COMPANY03',
      tier: 1,
      affiliateType: 'COMPANY',
      parentId: null,
      networkMembers: 0,
      networkEarned: 0,
      contractNotes: 'Mới ký hợp đồng - chưa phát triển mạng lưới',
      contractStartAt: new Date('2026-02-01'),
      contractEndAt: new Date('2027-01-31'),
      isActive: true,
      isVerified: true,
    },
  });

  // ═══════════════════════════════════════════════════════════
  // TIER 2 - KOCs (INDIVIDUALS)
  // ═══════════════════════════════════════════════════════════
  const koc1 = await prisma.ctvAffiliate.upsert({
    where: { email: 'koc1@gmail.com' },
    update: {},
    create: {
      email: 'koc1@gmail.com',
      nickname: 'KOC_Anna',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Phạm Thị An',
      phone: '0911111111',
      bankAccount: '2233445566',
      bankName: 'Vietcombank',
      commissionRate: 0.2,
      referralCode: 'KOC0001',
      referralUrl: 'https://vietshort.vn/?ref=KOC0001',
      tier: 2,
      affiliateType: 'INDIVIDUAL',
      parentId: company1.id,
      networkMembers: 1,
      networkEarned: 5000000,
      isActive: true,
      isVerified: true,
    },
  });

  const koc2 = await prisma.ctvAffiliate.upsert({
    where: { email: 'koc2@gmail.com' },
    update: {},
    create: {
      email: 'koc2@gmail.com',
      nickname: 'KOC_Brian',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Đỗ Văn Bình',
      phone: '0912222222',
      bankAccount: '3344556677',
      bankName: 'Techcombank',
      commissionRate: 0.25,
      referralCode: 'KOC0002',
      referralUrl: 'https://vietshort.vn/?ref=KOC0002',
      tier: 2,
      affiliateType: 'INDIVIDUAL',
      parentId: company1.id,
      networkMembers: 1,
      networkEarned: 3000000,
      isActive: true,
      isVerified: true,
    },
  });

  const koc3 = await prisma.ctvAffiliate.upsert({
    where: { email: 'koc3@gmail.com' },
    update: {},
    create: {
      email: 'koc3@gmail.com',
      nickname: 'KOC_Carol',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Hoàng Thị Chi',
      phone: '0913333333',
      bankAccount: '4455667788',
      bankName: 'ACB',
      commissionRate: 0.22,
      referralCode: 'KOC0003',
      referralUrl: 'https://vietshort.vn/?ref=KOC0003',
      tier: 2,
      affiliateType: 'INDIVIDUAL',
      parentId: company2.id,
      networkMembers: 1,
      networkEarned: 4000000,
      isActive: true,
      isVerified: true,
    },
  });

  const koc4 = await prisma.ctvAffiliate.upsert({
    where: { email: 'koc4@gmail.com' },
    update: {},
    create: {
      email: 'koc4@gmail.com',
      nickname: 'KOC_David',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Vũ Văn Dũng',
      phone: '0914444444',
      bankAccount: '5566778899',
      bankName: 'VietinBank',
      commissionRate: 0.2,
      referralCode: 'KOC0004',
      referralUrl: 'https://vietshort.vn/?ref=KOC0004',
      tier: 2,
      affiliateType: 'INDIVIDUAL',
      parentId: company2.id,
      networkMembers: 0,
      networkEarned: 0,
      isActive: true,
      isVerified: true,
    },
  });

  // ═══════════════════════════════════════════════════════════
  // TIER 3 - SUB-INDIVIDUALS
  // ═══════════════════════════════════════════════════════════
  await prisma.ctvAffiliate.upsert({
    where: { email: 'ctvuser1@gmail.com' },
    update: {},
    create: {
      email: 'ctvuser1@gmail.com',
      nickname: 'User_Emily',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Nguyễn Thị Em',
      phone: '0921111111',
      bankAccount: '6677889900',
      bankName: 'Vietcombank',
      commissionRate: 0.15,
      referralCode: 'USER0001',
      referralUrl: 'https://vietshort.vn/?ref=USER0001',
      tier: 3,
      affiliateType: 'INDIVIDUAL',
      parentId: koc1.id,
      networkMembers: 0,
      networkEarned: 0,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.ctvAffiliate.upsert({
    where: { email: 'ctvuser2@gmail.com' },
    update: {},
    create: {
      email: 'ctvuser2@gmail.com',
      nickname: 'User_Frank',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Trần Văn Phong',
      phone: '0922222222',
      bankAccount: '7788990011',
      bankName: 'Techcombank',
      commissionRate: 0.12,
      referralCode: 'USER0002',
      referralUrl: 'https://vietshort.vn/?ref=USER0002',
      tier: 3,
      affiliateType: 'INDIVIDUAL',
      parentId: koc2.id,
      networkMembers: 0,
      networkEarned: 0,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.ctvAffiliate.upsert({
    where: { email: 'ctvuser3@gmail.com' },
    update: {},
    create: {
      email: 'ctvuser3@gmail.com',
      nickname: 'User_Grace',
      passwordHash: ctvPassword,
      companyName: null,
      realName: 'Lý Thị Giang',
      phone: '0923333333',
      bankAccount: '8899001122',
      bankName: 'ACB',
      commissionRate: 0.1,
      referralCode: 'USER0003',
      referralUrl: 'https://vietshort.vn/?ref=USER0003',
      tier: 3,
      affiliateType: 'INDIVIDUAL',
      parentId: koc3.id,
      networkMembers: 0,
      networkEarned: 0,
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ 3-tier CTV network created (3 companies + 4 KOCs + 3 users)');

  // ═══════════════════════════════════════════════════════════
  // CTV PAYOUT REQUESTS
  // ═══════════════════════════════════════════════════════════
  console.log('💰 Creating CTV payout requests...');

  const payoutRequests = [
    {
      affiliateId: company1.id,
      amount: 10000000,
      bankAccount: company1.bankAccount!,
      bankName: company1.bankName!,
      notes: 'Rút tiền tháng 1/2026',
      status: PayoutStatus.COMPLETED,
      processedBy: 'superadmin@vietshort.com',
      processedAt: new Date('2026-02-01'),
      createdAt: new Date('2026-01-25'),
    },
    {
      affiliateId: company1.id,
      amount: 5000000,
      bankAccount: company1.bankAccount!,
      bankName: company1.bankName!,
      notes: 'Rút tiền tháng 2/2026',
      status: PayoutStatus.APPROVED,
      processedBy: 'admin@vietshort.com',
      processedAt: new Date('2026-02-10'),
      createdAt: new Date('2026-02-08'),
    },
    {
      affiliateId: company2.id,
      amount: 8000000,
      bankAccount: company2.bankAccount!,
      bankName: company2.bankName!,
      notes: 'Rút hoa hồng Q1/2026',
      status: PayoutStatus.PENDING,
      processedBy: null,
      processedAt: null,
      createdAt: new Date('2026-02-12'),
    },
    {
      affiliateId: koc1.id,
      amount: 3000000,
      bankAccount: koc1.bankAccount!,
      bankName: koc1.bankName!,
      notes: 'Rút tiền hoa hồng tháng 1',
      status: PayoutStatus.COMPLETED,
      processedBy: 'admin@vietshort.com',
      processedAt: new Date('2026-02-05'),
      createdAt: new Date('2026-02-01'),
    },
    {
      affiliateId: koc2.id,
      amount: 2000000,
      bankAccount: koc2.bankAccount!,
      bankName: koc2.bankName!,
      notes: 'Rút tiền - Bị từ chối vì chưa đủ doanh thu tối thiểu 3 triệu',
      status: PayoutStatus.REJECTED,
      processedBy: 'admin@vietshort.com',
      processedAt: new Date('2026-02-11'),
      createdAt: new Date('2026-02-10'),
    },
    {
      affiliateId: koc3.id,
      amount: 4000000,
      bankAccount: koc3.bankAccount!,
      bankName: koc3.bankName!,
      notes: 'Rút hoa hồng tháng 2',
      status: PayoutStatus.PENDING,
      processedBy: null,
      processedAt: null,
      createdAt: new Date('2026-02-13'),
    },
    {
      affiliateId: company3.id,
      amount: 500000,
      bankAccount: company3.bankAccount!,
      bankName: company3.bankName!,
      notes: 'Test rút tiền lần đầu - Chưa có doanh thu',
      status: PayoutStatus.REJECTED,
      processedBy: 'superadmin@vietshort.com',
      processedAt: new Date('2026-02-12'),
      createdAt: new Date('2026-02-11'),
    },
  ];

  for (const request of payoutRequests) {
    await prisma.ctvPayout.create({
      data: request,
    });
  }

  console.log('✅ Payout requests created\n');
}
