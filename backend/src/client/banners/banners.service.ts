import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { VipType } from '@prisma/client';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách banners đang active cho client
   * - Chỉ lấy banners isActive=true
   * - Lọc theo thời gian (startAt/endAt)
   * - Lọc theo VIP type nếu có
   * - Sắp xếp theo sortOrder
   */
  async getActiveBanners(vipType?: VipType, limit: number = 10) {
    const now = new Date();
    
    const where: any = {
      isActive: true,
    };

    // Lọc theo thời gian hiển thị
    where.OR = [
      { startAt: null, endAt: null },
      { startAt: { lte: now }, endAt: null },
      { startAt: null, endAt: { gte: now } },
      { startAt: { lte: now }, endAt: { gte: now } },
    ];

    // Lọc theo VIP type
    if (vipType) {
      where.AND = [
        {
          OR: [
            { targetVipType: null },
            { targetVipType: vipType },
          ],
        },
      ];
    } else {
      // Nếu không có vipType (người dùng free hoặc guest), chỉ lấy banners dành cho tất cả
      where.targetVipType = null;
    }

    const banners = await this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      take: limit,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkType: true,
        linkTarget: true,
        sortOrder: true,
      },
    });

    this.logger.log(`Fetched ${banners.length} active banners for vipType: ${vipType || 'free'}`);
    
    return banners;
  }

  /**
   * Lấy banner theo ID (cho các link internal video)
   */
  async getBannerById(id: string) {
    return this.prisma.banner.findFirst({
      where: {
        id,
        isActive: true,
      },
    });
  }
}
