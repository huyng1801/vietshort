import { PrismaClient, AdminRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedAdmins(prisma: PrismaClient) {
  console.log('👥 Creating admin accounts...');

  const superAdminPassword = await bcrypt.hash('superadmin123', 12);
  await prisma.admin.upsert({
    where: { email: 'superadmin@vietshort.com' },
    update: {},
    create: {
      email: 'superadmin@vietshort.com',
      nickname: 'SuperAdmin',
      passwordHash: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: AdminRole.SUPER_ADMIN,
      permissions: JSON.stringify(['*']),
      isActive: true,
    },
  });

  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@vietshort.com' },
    update: {},
    create: {
      email: 'admin@vietshort.com',
      nickname: 'Admin',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: AdminRole.ADMIN,
      permissions: JSON.stringify(['user_management', 'content_management', 'analytics']),
      isActive: true,
    },
  });

  const contentManagerPassword = await bcrypt.hash('content123', 12);
  await prisma.admin.upsert({
    where: { email: 'content@vietshort.com' },
    update: {},
    create: {
      email: 'content@vietshort.com',
      nickname: 'ContentManager',
      passwordHash: contentManagerPassword,
      firstName: 'Content',
      lastName: 'Manager',
      role: AdminRole.CONTENT_MANAGER,
      permissions: JSON.stringify(['content_management', 'video_review']),
      isActive: true,
    },
  });

  const moderatorPassword = await bcrypt.hash('mod123', 12);
  await prisma.admin.upsert({
    where: { email: 'moderator@vietshort.com' },
    update: {},
    create: {
      email: 'moderator@vietshort.com',
      nickname: 'Moderator',
      passwordHash: moderatorPassword,
      firstName: 'Moderator',
      lastName: 'User',
      role: AdminRole.MODERATOR,
      permissions: JSON.stringify(['user_moderation', 'comment_moderation']),
      isActive: true,
    },
  });

  console.log('✅ Admin accounts created\n');
}
