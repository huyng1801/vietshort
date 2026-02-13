import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { CreateSubtitleDto, UpdateSubtitleDto } from './dto/subtitle.dto';

@Injectable()
export class SubtitlesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubtitleDto) {
    return this.prisma.subtitle.create({ data: dto });
  }

  async findByEpisode(episodeId: string) {
    return this.prisma.subtitle.findMany({
      where: { episodeId },
      orderBy: { language: 'asc' },
    });
  }

  async update(id: string, dto: UpdateSubtitleDto) {
    return this.prisma.subtitle.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.subtitle.delete({ where: { id } });
  }
}
