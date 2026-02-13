import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { R2StorageService } from '../videos/services/r2-storage.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannerManagementService {
  private readonly logger = new Logger(BannerManagementService.name);

  constructor(
    private prisma: PrismaService,
    private r2Storage: R2StorageService,
  ) {}

  // ─── Banner Management ─────────────────────────────────

  async getMaxSortOrder() {
    const result = await this.prisma.banner.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    
    return { maxSortOrder: result?.sortOrder || 0 };
  }

  async getBanners(search?: string, isActive?: boolean, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { linkTarget: { contains: search } },
      ];
    }

    const [banners, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.banner.count({ where }),
    ]);

    return {
      data: banners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getBannerById(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner với ID: ${id}`);
    }

    return banner;
  }

  async createBanner(dto: CreateBannerDto) {
    const banner = await this.prisma.banner.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        linkType: dto.linkType || null,
        linkTarget: dto.linkTarget || null,
        sortOrder: dto.sortOrder || 0,
        isActive: true,
        startAt: dto.startAt ? new Date(dto.startAt) : null,
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        targetVipType: dto.targetVipType || null,
      },
    });

    this.logger.log(`Banner created: ${banner.id} - ${banner.title}`);
    return banner;
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    // Check banner exists
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner với ID: ${id}`);
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.linkType !== undefined) updateData.linkType = dto.linkType;
    if (dto.linkTarget !== undefined) updateData.linkTarget = dto.linkTarget;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.startAt !== undefined) updateData.startAt = dto.startAt ? new Date(dto.startAt) : null;
    if (dto.endAt !== undefined) updateData.endAt = dto.endAt ? new Date(dto.endAt) : null;
    if (dto.targetVipType !== undefined) updateData.targetVipType = dto.targetVipType || null;

    const updated = await this.prisma.banner.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Banner updated: ${id} - ${updated.title}`);
    return updated;
  }

  async deleteBanner(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner với ID: ${id}`);
    }

    const deleted = await this.prisma.banner.delete({ where: { id } });
    this.logger.log(`Banner deleted: ${id} - ${deleted.title}`);
    return { message: `Banner "${deleted.title}" đã bị xóa` };
  }

  async reorderBanners(bannerIds: string[]) {
    const transaction = [];
    
    for (let i = 0; i < bannerIds.length; i++) {
      transaction.push(
        this.prisma.banner.update({
          where: { id: bannerIds[i] },
          data: { sortOrder: i + 1 },
        })
      );
    }

    await this.prisma.$transaction(transaction);
    this.logger.log(`Reordered ${bannerIds.length} banners`);
    
    return { message: 'Đã cập nhật thứ tự banner' };
  }

  async toggleBannerStatus(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner với ID: ${id}`);
    }

    const updated = await this.prisma.banner.update({
      where: { id },
      data: { isActive: !banner.isActive },
    });

    const status = updated.isActive ? 'kích hoạt' : 'vô hiệu hóa';
    this.logger.log(`Banner ${status}: ${id} - ${updated.title}`);
    
    return { 
      message: `Đã ${status} banner "${updated.title}"`,
      isActive: updated.isActive
    };
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để upload');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ file ảnh (.jpg, .jpeg, .png, .gif, .webp)');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Kích thước file không được vượt quá 5MB');
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.originalname.split('.').pop();
      const key = `banners/${timestamp}.${ext}`;

      // Upload to R2
      const cdnUrl = await this.r2Storage.uploadBuffer(key, file.buffer, file.mimetype);

      this.logger.log(`Banner image uploaded: ${key} -> ${cdnUrl}`);

      return {
        success: true,
        data: {
          url: cdnUrl,
          key: key,
          originalName: file.originalname,
          size: file.size,
        }
      };
    } catch (error: any) {
      this.logger.error(`Failed to upload banner image: ${error.message}`);
      throw new BadRequestException(`Upload thất bại: ${error.message}`);
    }
  }
}