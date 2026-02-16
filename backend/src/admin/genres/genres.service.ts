import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';

@Injectable()
export class GenresManagementService {
  private readonly logger = new Logger(GenresManagementService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Genre Management ─────────────────────────────────

  async getMaxSortOrder() {
    const result = await this.prisma.genre.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    
    return { maxSortOrder: result?.sortOrder || 0 };
  }

  async getGenres(search?: string, isActive?: boolean, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const [genres, total] = await Promise.all([
      this.prisma.genre.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.genre.count({ where }),
    ]);

    // Get videoCount for each genre
    const genresWithVideoCount = await Promise.all(
      genres.map(async (genre) => {
        const videoCount = await this.prisma.video.count({
          where: {
            genres: {
              contains: genre.name,
            },
          },
        });
        return { ...genre, videoCount };
      })
    );

    return {
      data: genresWithVideoCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getGenreById(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
    });

    if (!genre) {
      throw new NotFoundException(`Không tìm thấy thể loại với ID: ${id}`);
    }

    // Count videos by searching Video.genres string (comma separated)
    const videoCount = await this.prisma.video.count({
      where: {
        genres: {
          contains: genre.name,
        },
      },
    });

    return {
      ...genre,
      videoCount,
    };
  }

  async createGenre(dto: CreateGenreDto) {
    // Check slug uniqueness
    const existingSlug = await this.prisma.genre.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new BadRequestException(`Slug "${dto.slug}" đã tồn tại`);
    }

    // Check name uniqueness
    const existingName = await this.prisma.genre.findUnique({
      where: { name: dto.name },
    });

    if (existingName) {
      throw new BadRequestException(`Tên thể loại "${dto.name}" đã tồn tại`);
    }

    const genre = await this.prisma.genre.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description || null,
        sortOrder: dto.sortOrder || 0,
        isActive: true,
      },
    });

    this.logger.log(`Genre created: ${genre.id} - ${genre.name}`);
    return genre;
  }

  async updateGenre(id: string, dto: UpdateGenreDto) {
    // Check genre exists
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      throw new NotFoundException(`Không tìm thấy thể loại với ID: ${id}`);
    }

    // Check slug uniqueness if updating
    if (dto.slug && dto.slug !== genre.slug) {
      const existingSlug = await this.prisma.genre.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug) {
        throw new BadRequestException(`Slug "${dto.slug}" đã tồn tại`);
      }
    }

    // Check name uniqueness if updating
    if (dto.name && dto.name !== genre.name) {
      const existingName = await this.prisma.genre.findUnique({
        where: { name: dto.name },
      });
      if (existingName) {
        throw new BadRequestException(`Tên thể loại "${dto.name}" đã tồn tại`);
      }
    }

    const updated = await this.prisma.genre.update({
      where: { id },
      data: {
        name: dto.name || genre.name,
        slug: dto.slug || genre.slug,
        description: dto.description !== undefined ? dto.description : genre.description,
        sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : genre.sortOrder,
        isActive: dto.isActive !== undefined ? dto.isActive : genre.isActive,
      },
    });

    this.logger.log(`Genre updated: ${id} - ${updated.name}`);
    return updated;
  }

  async deleteGenre(id: string) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      throw new NotFoundException(`Không tìm thấy thể loại với ID: ${id}`);
    }

    const deleted = await this.prisma.genre.delete({ where: { id } });
    this.logger.log(`Genre deleted: ${id} - ${deleted.name}`);
    return { message: `Thể loại "${deleted.name}" đã bị xóa` };
  }
}
