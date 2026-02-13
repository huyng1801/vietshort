import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/config/database.config';

describe('Admin Banners API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let testBannerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // ─── Cleanup: Clear all test data ───
    await prisma.banner.deleteMany({});
    await prisma.admin.deleteMany({});

    // ─── Setup: Create admin and login ───
    const bcrypt = require('bcryptjs');
    const adminEmail = `admin-banners-${Date.now()}@test.com`;
    const hashedPassword = await bcrypt.hash('Admin@12345', 10);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        nickname: `admin-banners-${Date.now()}`,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'Test',
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify(['*']),
        isActive: true,
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/admin/login')
      .send({ email: adminEmail, password: 'Admin@12345' })
      .expect(200);

    adminToken = loginResponse.body?.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.banner.deleteMany({});
    await prisma.admin.deleteMany({});
    await app.close();
  });

  describe('GET /admin/banners', () => {
    beforeEach(async () => {
      // Create test data with unique names
      const timestamp = Date.now();
      await prisma.banner.createMany({
        data: [
          {
            title: `Banner 1-${timestamp}`,
            imageUrl: 'https://example.com/banner1.jpg',
            linkType: 'promotion',
            linkTarget: '/promo1',
            sortOrder: 1,
            isActive: true,
          },
          {
            title: `Banner 2-${timestamp}`,
            imageUrl: 'https://example.com/banner2.jpg',
            linkType: 'video',
            linkTarget: 'video-123',
            sortOrder: 2,
            isActive: true,
          },
          {
            title: `Banner 3-${timestamp}`,
            imageUrl: 'https://example.com/banner3.jpg',
            linkType: 'external',
            linkTarget: 'https://external.com',
            sortOrder: 3,
            isActive: false,
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.banner.deleteMany({});
    });

    it('should get all banners', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return pagination info', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/banners?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBeGreaterThan(0);
      expect(response.body.pagination.pages).toBeGreaterThan(0);
    });

    it('should filter banners by search', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/banners?search=Banner%201')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBeGreaterThan(0);
      const hasBanner1 = response.body.data.some((b: any) => b.title.includes('Banner 1'));
      expect(hasBanner1).toBe(true);
    });

    it('should filter banners by active status', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/banners?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toBeDefined();
      for (const banner of response.body.data) {
        expect(banner.isActive).toBe(true);
      }
    });

    it('should filter inactive banners', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/banners?isActive=false')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      if (response.body.data.length > 0) {
        for (const banner of response.body.data) {
          expect(banner.isActive).toBe(false);
        }
      }
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .get('/admin/banners')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/admin/banners')
        .set('Authorization', 'Bearer invalid_token')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /admin/banners/:id', () => {
    beforeEach(async () => {
      const banner = await prisma.banner.create({
        data: {
          title: `Test Banner-${Date.now()}`,
          imageUrl: 'https://example.com/test.jpg',
          linkType: 'promotion',
          linkTarget: '/test',
          sortOrder: 1,
          isActive: true,
        },
      });
      testBannerId = banner.id;
    });

    afterEach(async () => {
      await prisma.banner.deleteMany({});
    });

    it('should get banner by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testBannerId);
      expect(response.body.title).toContain('Test Banner');
      expect(response.body.imageUrl).toBe('https://example.com/test.jpg');
      expect(response.body.linkType).toBe('promotion');
    });

    it('should return 404 for non-existent banner', async () => {
      await request(app.getHttpServer())
        .get('/admin/banners/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .get(`/admin/banners/${testBannerId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /admin/banners', () => {
    afterEach(async () => {
      await prisma.banner.deleteMany({});
    });

    it('should create a new banner', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `New Banner-${timestamp}`,
          imageUrl: 'https://example.com/new-banner.jpg',
          linkType: 'promotion',
          linkTarget: '/promo',
          sortOrder: 1,
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(`New Banner-${timestamp}`);
      expect(response.body.imageUrl).toBe('https://example.com/new-banner.jpg');
      expect(response.body.linkType).toBe('promotion');
      expect(response.body.isActive).toBe(true);

      testBannerId = response.body.id;
    });

    it('should create banner with all fields', async () => {
      const timestamp = Date.now();
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app.getHttpServer())
        .post('/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Full Banner-${timestamp}`,
          imageUrl: 'https://example.com/full.jpg',
          linkType: 'video',
          linkTarget: 'video-456',
          sortOrder: 5,
          startAt: startDate,
          endAt: endDate,
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.title).toBe(`Full Banner-${timestamp}`);
      expect(response.body.sortOrder).toBe(5);
      expect(response.body.startAt).toBeDefined();
      expect(response.body.endAt).toBeDefined();
    });

    it('should create banner with minimum required fields', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Minimal Banner-${timestamp}`,
          imageUrl: 'https://example.com/minimal.jpg',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.title).toBe(`Minimal Banner-${timestamp}`);
      expect(response.body.isActive).toBe(true);
      expect(response.body.sortOrder).toBe(0);
    });

    it('should fail with missing required title', async () => {
      await request(app.getHttpServer())
        .post('/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          imageUrl: 'https://example.com/no-title.jpg',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail with missing required imageUrl', async () => {
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post('/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `No Image-${timestamp}`,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail with invalid linkType', async () => {
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post('/admin/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Invalid Link-${timestamp}`,
          imageUrl: 'https://example.com/invalid.jpg',
          linkType: 'invalid_type',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 without authorization', async () => {
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post('/admin/banners')
        .send({
          title: `Unauthorized-${timestamp}`,
          imageUrl: 'https://example.com/banner.jpg',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /admin/banners/:id', () => {
    beforeEach(async () => {
      const banner = await prisma.banner.create({
        data: {
          title: `Update Test-${Date.now()}`,
          imageUrl: 'https://example.com/update.jpg',
          linkType: 'promotion',
          linkTarget: '/update',
          sortOrder: 10,
          isActive: true,
        },
      });
      testBannerId = banner.id;
    });

    afterEach(async () => {
      await prisma.banner.deleteMany({});
    });

    it('should update banner title', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Updated Title-${timestamp}`,
        })
        .expect(HttpStatus.OK);

      expect(response.body.title).toBe(`Updated Title-${timestamp}`);
    });

    it('should update banner imageUrl', async () => {
      const newUrl = `https://example.com/new-image-${Date.now()}.jpg`;
      const response = await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          imageUrl: newUrl,
        })
        .expect(HttpStatus.OK);

      expect(response.body.imageUrl).toBe(newUrl);
    });

    it('should update banner linkType and target', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          linkType: 'video',
          linkTarget: 'video-789',
        })
        .expect(HttpStatus.OK);

      expect(response.body.linkType).toBe('video');
      expect(response.body.linkTarget).toBe('video-789');
    });

    it('should update banner sortOrder', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sortOrder: 50,
        })
        .expect(HttpStatus.OK);

      expect(response.body.sortOrder).toBe(50);
    });

    it('should update banner isActive status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false,
        })
        .expect(HttpStatus.OK);

      expect(response.body.isActive).toBe(false);
    });

    it('should update banner dates', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          startAt: startDate,
          endAt: endDate,
        })
        .expect(HttpStatus.OK);

      expect(response.body.startAt).toBeDefined();
      expect(response.body.endAt).toBeDefined();
    });

    it('should clear banner targetVipType', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          targetVipType: null,
        })
        .expect(HttpStatus.OK);

      expect(response.body.targetVipType).toBeNull();
    });

    it('should update multiple fields at once', async () => {
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Multi Update-${timestamp}`,
          imageUrl: 'https://example.com/multi.jpg',
          sortOrder: 99,
          isActive: false,
        })
        .expect(HttpStatus.OK);

      expect(response.body.title).toBe(`Multi Update-${timestamp}`);
      expect(response.body.imageUrl).toBe('https://example.com/multi.jpg');
      expect(response.body.sortOrder).toBe(99);
      expect(response.body.isActive).toBe(false);
    });

    it('should return 404 for non-existent banner', async () => {
      await request(app.getHttpServer())
        .patch('/admin/banners/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated',
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/banners/${testBannerId}`)
        .send({
          title: 'Updated',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /admin/banners/:id', () => {
    beforeEach(async () => {
      const banner = await prisma.banner.create({
        data: {
          title: `Delete Test-${Date.now()}`,
          imageUrl: 'https://example.com/delete.jpg',
          linkType: 'promotion',
          linkTarget: '/delete',
          sortOrder: 1,
          isActive: true,
        },
      });
      testBannerId = banner.id;
    });

    afterEach(async () => {
      await prisma.banner.deleteMany({});
    });

    it('should delete banner successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/banners/${testBannerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      expect(response.body.message).toContain('đã bị xóa');

      const deletedBanner = await prisma.banner.findUnique({
        where: { id: testBannerId },
      });

      expect(deletedBanner).toBeNull();
    });

    it('should return 404 when deleting non-existent banner', async () => {
      await request(app.getHttpServer())
        .delete('/admin/banners/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/banners/${testBannerId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /admin/banners/:id/toggle', () => {
    beforeEach(async () => {
      const banner = await prisma.banner.create({
        data: {
          title: `Toggle Test-${Date.now()}`,
          imageUrl: 'https://example.com/toggle.jpg',
          linkType: 'promotion',
          linkTarget: '/toggle',
          sortOrder: 1,
          isActive: true,
        },
      });
      testBannerId = banner.id;
    });

    afterEach(async () => {
      await prisma.banner.deleteMany({});
    });

    it('should toggle banner from active to inactive', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/banners/${testBannerId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201]).toContain(response.status);
      expect(response.body.isActive).toBe(false);
      expect(response.body.message).toContain('vô hiệu hóa');
    });

    it('should toggle banner from inactive to active', async () => {
      // First toggle to inactive
      await request(app.getHttpServer())
        .post(`/admin/banners/${testBannerId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then toggle back to active
      const response = await request(app.getHttpServer())
        .post(`/admin/banners/${testBannerId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201]).toContain(response.status);
      expect(response.body.isActive).toBe(true);
      expect(response.body.message).toContain('kích hoạt');
    });

    it('should return 404 for non-existent banner', async () => {
      await request(app.getHttpServer())
        .post('/admin/banners/non-existent-id/toggle')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .post(`/admin/banners/${testBannerId}/toggle`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /admin/banners/reorder', () => {
    beforeEach(async () => {
      const timestamp = Date.now();
      const banner1 = await prisma.banner.create({
        data: {
          title: `Reorder Test 1-${timestamp}`,
          imageUrl: 'https://example.com/reorder1.jpg',
          sortOrder: 1,
          isActive: true,
        },
      });

      const banner2 = await prisma.banner.create({
        data: {
          title: `Reorder Test 2-${timestamp}`,
          imageUrl: 'https://example.com/reorder2.jpg',
          sortOrder: 2,
          isActive: true,
        },
      });

      const banner3 = await prisma.banner.create({
        data: {
          title: `Reorder Test 3-${timestamp}`,
          imageUrl: 'https://example.com/reorder3.jpg',
          sortOrder: 3,
          isActive: true,
        },
      });

      testBannerId = banner1.id; // Store for cleanup
    });

    afterEach(async () => {
      await prisma.banner.deleteMany({});
    });

    it('should reorder banners', async () => {
      // Get all banners first
      const banners = await prisma.banner.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      const bannerIds = banners.map((b) => b.id);
      // Reverse the order
      const reversedIds = bannerIds.reverse();

      const response = await request(app.getHttpServer())
        .post('/admin/banners/reorder')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bannerIds: reversedIds,
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.message).toContain('cập nhật');

      // Verify the order was updated
      const updatedBanners = await prisma.banner.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      for (let i = 0; i < updatedBanners.length; i++) {
        expect(updatedBanners[i].sortOrder).toBe(i + 1);
      }
    });

    it('should handle single banner reorder', async () => {
      const banners = await prisma.banner.findMany();
      const singleBannerId = [banners[0].id];

      const response = await request(app.getHttpServer())
        .post('/admin/banners/reorder')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bannerIds: singleBannerId,
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.message).toBeDefined();
    });

    it('should return 401 without authorization', async () => {
      const banners = await prisma.banner.findMany();
      await request(app.getHttpServer())
        .post('/admin/banners/reorder')
        .send({
          bannerIds: banners.map((b) => b.id),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /admin/banners/max-sort-order', () => {
    beforeEach(async () => {
      const timestamp = Date.now();
      await prisma.banner.createMany({
        data: [
          {
            title: `B1-${timestamp}`,
            imageUrl: 'https://example.com/b1.jpg',
            sortOrder: 5,
            isActive: true,
          },
          {
            title: `B2-${timestamp}`,
            imageUrl: 'https://example.com/b2.jpg',
            sortOrder: 15,
            isActive: true,
          },
          {
            title: `B3-${timestamp}`,
            imageUrl: 'https://example.com/b3.jpg',
            sortOrder: 25,
            isActive: true,
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.banner.deleteMany({});
    });

    it('should return max sort order', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/banners/max-sort-order')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.maxSortOrder).toBe(25);
    });

    it('should return 0 when no banners exist', async () => {
      await prisma.banner.deleteMany({});

      const response = await request(app.getHttpServer())
        .get('/admin/banners/max-sort-order')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.maxSortOrder).toBe(0);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .get('/admin/banners/max-sort-order')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
