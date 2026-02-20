import { PrismaClient } from '@prisma/client';

// Import all seed functions
import { seedAdmins } from './admin.seed';
import { seedGenres } from './genres.seed';
import { seedVipPlans } from './vip-plans.seed';
import { seedGoldPackages } from './gold-packages.seed';
import { seedGamification } from './gamification.seed';
import { seedBanners } from './banners.seed';
import { seedCtvAffiliates } from './ctv-affiliates.seed';
import { seedExchangeCodes } from './exchange-codes.seed';
import { seedUsers } from './users.seed';
import { seedVideos } from './videos.seed';
import { seedSubtitles } from './subtitles.seed';
import { seedInteractions } from './interactions.seed';
import { seedNotifications } from './notifications.seed';
import { seedAds } from './ads.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding for VietShort - Chinese Short Drama Platform...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // PHASE 1: Base Configuration
    console.log('📋 PHASE 1: Base Configuration\n');
    await seedAdmins(prisma);
    await seedGenres(prisma);
    await seedVipPlans(prisma);
    await seedGoldPackages(prisma);
    await seedGamification(prisma);

    // PHASE 1.5: Ads Configuration
    console.log('📋 PHASE 1.5: Ads Configuration\n');
    await seedAds(prisma);

    // PHASE 2: Content & Marketing
    console.log('📋 PHASE 2: Content & Marketing\n');
    await seedBanners(prisma);
    await seedCtvAffiliates(prisma);
    await seedExchangeCodes(prisma);

    // PHASE 3: Users & Videos
    console.log('📋 PHASE 3: Users & Content\n');
    const users = await seedUsers(prisma);
    const videos = await seedVideos(prisma);
    await seedSubtitles(prisma, videos);

    // PHASE 4: User Interactions
    console.log('📋 PHASE 4: User Interactions\n');
    await seedInteractions(prisma, users, videos);
    await seedNotifications(prisma, users);

    // Summary
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    console.log('📊 DATA SEEDED:');
    console.log('  ✓ 4 Admin Accounts');
    console.log('  ✓ 20 Genre Tags');
    console.log('  ✓ 6 VIP Plans (FreeAds & Gold)');
    console.log('  ✓ 6 Gold Packages (Bảng giá nạp Gold)');
    console.log('  ✓ 7 Daily Tasks');
    console.log('  ✓ 7 Check-in Reward Configurations');
    console.log('  ✓ 13 Achievements');
    console.log('  ✓ 1 Ad Config + 10 Ad Placements');
    console.log('  ✓ 3 Promotional Banners');
    console.log('  ✓ 10 CTV Affiliates (3-tier network)');
    console.log('  ✓ 7 Payout Requests');
    console.log('  ✓ 2 CTV Referrals');
    console.log('  ✓ 3 Code Batches + 7 Exchange Codes');
    console.log('  ✓ 2 Code Redemptions');
    console.log('  ✓ 4 Test User Accounts');
    console.log('  ✓ 3 Sample Videos');
    console.log('  ✓ 12 Episodes');
    console.log('  ✓ 11 Subtitles (Vietnamese & English)');
    console.log('  ✓ Sample Watch History, Favorites, Likes, Ratings, Comments');
    console.log('  ✓ Sample Unlocks & Transactions');
    console.log('  ✓ Sample Check-ins');
    console.log('  ✓ Sample Daily Task Progress');
    console.log('  ✓ Sample Achievements Unlocked');
    console.log('  ✓ Sample Notifications');
    console.log('');

    console.log('👥 ADMIN LOGIN:');
    console.log('┌─────────────────────┬───────────────────────────┬───────────────┐');
    console.log('│ Role                │ Email                     │ Password      │');
    console.log('├─────────────────────┼───────────────────────────┼───────────────┤');
    console.log('│ SUPER_ADMIN         │ superadmin@vietshort.com  │ superadmin123 │');
    console.log('│ ADMIN               │ admin@vietshort.com       │ admin123      │');
    console.log('│ CONTENT_MANAGER     │ content@vietshort.com     │ content123    │');
    console.log('│ MODERATOR           │ moderator@vietshort.com   │ mod123        │');
    console.log('└─────────────────────┴───────────────────────────┴───────────────┘');
    console.log('');

    console.log('👤 TEST USERS:');
    console.log('┌────────────────────┬──────────┬──────────────┬─────────┐');
    console.log('│ Email              │ Password │ VIP Type     │ Gold    │');
    console.log('├────────────────────┼──────────┼──────────────┼─────────┤');
    console.log('│ user1@test.com     │ user123456│ NORMAL      │ 500     │');
    console.log('│ user2@test.com     │ user123456│ VIP_FREEADS │ 1000    │');
    console.log('│ user3@test.com     │ user123456│ VIP_GOLD    │ 2000    │');
    console.log('│ guest@test.com     │ (guest)   │ NORMAL      │ 200     │');
    console.log('└────────────────────┴──────────┴──────────────┴─────────┘');
    console.log('');

    console.log('🤝 CTV 3-TIER NETWORK:');
    console.log('┌─────────────────────────────┬──────────┬──────────────┬──────────┐');
    console.log('│ Email                       │ Password │ Tier         │ Ref Code │');
    console.log('├─────────────────────────────┼──────────┼──────────────┼──────────┤');
    console.log('│ TIER 1 - COMPANIES                                              │');
    console.log('│ company1@vietmedia.com      │ ctv123456│ 1-COMPANY    │COMPANY01 │');
    console.log('│ company2@digitalads.com     │ ctv123456│ 1-COMPANY    │COMPANY02 │');
    console.log('│ company3@socialhub.com      │ ctv123456│ 1-COMPANY    │COMPANY03 │');
    console.log('├─────────────────────────────┼──────────┼──────────────┼──────────┤');
    console.log('│ TIER 2 - KOCs                                                   │');
    console.log('│ koc1@gmail.com              │ ctv123456│ 2-INDIVIDUAL │ KOC0001  │');
    console.log('│ koc2@gmail.com              │ ctv123456│ 2-INDIVIDUAL │ KOC0002  │');
    console.log('│ koc3@gmail.com              │ ctv123456│ 2-INDIVIDUAL │ KOC0003  │');
    console.log('│ koc4@gmail.com              │ ctv123456│ 2-INDIVIDUAL │ KOC0004  │');
    console.log('├─────────────────────────────┼──────────┼──────────────┼──────────┤');
    console.log('│ TIER 3 - USERS                                                  │');
    console.log('│ ctvuser1@gmail.com          │ ctv123456│ 3-INDIVIDUAL │ USER0001 │');
    console.log('│ ctvuser2@gmail.com          │ ctv123456│ 3-INDIVIDUAL │ USER0002 │');
    console.log('│ ctvuser3@gmail.com          │ ctv123456│ 3-INDIVIDUAL │ USER0003 │');
    console.log('└─────────────────────────────┴──────────┴──────────────┴──────────┘');
    console.log('');

    console.log('🎟️  EXCHANGE CODES:');
    console.log('┌──────────────────┬─────────────────────────────────────┐');
    console.log('│ Batch            │ Codes / Reward                      │');
    console.log('├──────────────────┼─────────────────────────────────────┤');
    console.log('│ Welcome Pack 2024│ 3 codes / 100 Gold                  │');
    console.log('│ VIP Trial Pack   │ 2 codes / VIP 7 days                │');
    console.log('│ Tết 2025 Event   │ 2 codes / 200 Gold                  │');
    console.log('└──────────────────┴─────────────────────────────────────┘');
    console.log('');

    console.log('⚠️  IMPORTANT NOTES:');
    console.log('  • Videos use placeholder URLs - Update with real R2 paths after upload');
    console.log('  • Banner images are placeholder - Upload actual images');
    console.log('  • Change default passwords before production');
    console.log('  • Configure payment gateways (VNPay, Momo) in .env');
    console.log('  • Set up Cloudflare R2 for video storage');
    console.log('  • Configure Firebase for push notifications');
    console.log('');

    console.log('🎬 NEXT STEPS:');
    console.log('  1. Upload videos to Cloudflare R2');
    console.log('  2. Update video URLs in database');
    console.log('  3. Configure payment providers');
    console.log('  4. Set up video encoding worker');
    console.log('  5. Test complete user flow');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
