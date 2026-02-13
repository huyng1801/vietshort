import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RewardType } from '@prisma/client';
import { CreateCodeBatchDto, DeactivateCodeBatchDto } from './dto/create-code-batch.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class CodeBatchService {
  constructor(private prisma: PrismaService) {}

  private generateRandomCode(length: number = 8, prefix?: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix ? `${prefix}_` : '';
    const remainingLength = Math.max(length - result.length, 4);
    
    for (let i = 0; i < remainingLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createBatch(dto: CreateCodeBatchDto) {
    const rewardValue = dto.rewardType === RewardType.GOLD ? dto.goldValue : (dto.vipDays || 0);

    if (rewardValue <= 0) {
      throw new BadRequestException(
        dto.rewardType === RewardType.GOLD 
          ? 'Giá trị gold phải lớn hơn 0' 
          : 'Số ngày VIP phải lớn hơn 0'
      );
    }

    // Check duplicate batch name
    const existing = await this.prisma.codeBatch.findUnique({
      where: { batchName: dto.batchName },
    });
    if (existing) {
      throw new BadRequestException('Tên lô mã đã tồn tại');
    }

    const codeLength = dto.codeLength || 8;
    const usageLimit = dto.usageLimit || 1;
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    return this.prisma.$transaction(async (tx) => {
      // Create the batch record
      const batch = await tx.codeBatch.create({
        data: {
          batchName: dto.batchName,
          rewardType: dto.rewardType,
          rewardValue,
          quantity: dto.quantity,
          usageLimit,
          codeLength,
          codePrefix: dto.codePrefix || null,
          isActive: true,
          expiresAt,
          createdBy: dto.createdBy,
        },
      });

      // Generate unique codes
      const codes: string[] = [];
      const existingCodes = new Set<string>();
      const maxAttempts = dto.quantity * 10;
      let attempts = 0;

      while (codes.length < dto.quantity && attempts < maxAttempts) {
        const code = this.generateRandomCode(codeLength, dto.codePrefix);
        attempts++;
        
        if (existingCodes.has(code)) continue;
        
        const dbExisting = await tx.exchangeCode.findUnique({
          where: { code },
          select: { id: true },
        });
        
        if (!dbExisting) {
          codes.push(code);
          existingCodes.add(code);
        }
      }

      if (codes.length < dto.quantity) {
        throw new BadRequestException(
          'Không thể tạo đủ mã duy nhất. Hãy thử prefix khác hoặc tăng độ dài mã'
        );
      }

      // Bulk create exchange codes linked to the batch
      await tx.exchangeCode.createMany({
        data: codes.map(code => ({
          code,
          batchId: batch.id,
          batchName: batch.batchName,
          rewardType: batch.rewardType,
          rewardValue: batch.rewardValue,
          usageLimit,
          codeLength,
          expiresAt,
          createdBy: dto.createdBy,
        })),
      });

      return { ...batch, codes };
    });
  }

  async findAllBatches(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [batches, total] = await Promise.all([
      this.prisma.codeBatch.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.codeBatch.count(),
    ]);

    // Aggregate usage stats per batch
    const batchesWithStats = await Promise.all(
      batches.map(async (batch) => {
        const stats = await this.prisma.exchangeCode.aggregate({
          where: { batchId: batch.id },
          _count: { _all: true },
          _sum: { usedCount: true },
        });
        
        const totalCodes = stats._count._all;
        const usedCodes = stats._sum.usedCount || 0;

        return {
          ...batch,
          totalCodes,
          usedCodes,
          remainingCodes: totalCodes - usedCodes,
          usagePercentage: totalCodes > 0 ? Math.round((usedCodes / totalCodes) * 100) : 0,
        };
      })
    );

    return {
      data: batchesWithStats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBatchById(id: string) {
    const batch = await this.prisma.codeBatch.findUnique({
      where: { id },
      include: {
        codes: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!batch) {
      throw new NotFoundException('Không tìm thấy lô mã');
    }

    const usedCodes = batch.codes.reduce((sum, c) => sum + c.usedCount, 0);

    return {
      ...batch,
      totalCodes: batch.codes.length,
      usedCodes,
      remainingCodes: batch.codes.length - usedCodes,
      usagePercentage: batch.codes.length > 0
        ? Math.round((usedCodes / batch.codes.length) * 100)
        : 0,
    };
  }

  async deactivateBatch(id: string, dto: DeactivateCodeBatchDto) {
    const batch = await this.prisma.codeBatch.findUnique({ where: { id } });
    if (!batch) throw new NotFoundException('Không tìm thấy lô mã');
    if (!batch.isActive) throw new BadRequestException('Lô mã đã được vô hiệu hóa');

    await this.prisma.$transaction([
      this.prisma.codeBatch.update({
        where: { id },
        data: { isActive: false },
      }),
      this.prisma.exchangeCode.updateMany({
        where: { batchId: id },
        data: { isActive: false },
      }),
    ]);

    return { success: true, message: 'Đã vô hiệu hóa lô mã thành công' };
  }

  async exportBatchToExcel(id: string): Promise<Buffer> {
    const batch = await this.prisma.codeBatch.findUnique({
      where: { id },
      include: { codes: { orderBy: { createdAt: 'asc' } } },
    });

    if (!batch) throw new NotFoundException('Không tìm thấy lô mã');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VietShort Admin';
    const ws = workbook.addWorksheet('Mã đổi quà');

    // Batch info header
    ws.addRow(['Lô mã:', batch.batchName]);
    ws.addRow(['Loại phần thưởng:', batch.rewardType === RewardType.GOLD ? 'Xu vàng' : 'VIP Days']);
    ws.addRow(['Giá trị:', batch.rewardValue]);
    ws.addRow(['Tổng số mã:', batch.codes.length]);
    ws.addRow(['Ngày tạo:', batch.createdAt.toLocaleDateString('vi-VN')]);
    ws.addRow(['Người tạo:', batch.createdBy]);
    ws.addRow([]);

    // Bold batch info
    for (let i = 1; i <= 6; i++) {
      ws.getRow(i).getCell(1).font = { bold: true };
    }

    // Data table header
    const headerRow = ws.addRow(['STT', 'Mã đổi quà', 'Trạng thái', 'Lượt dùng', 'Giới hạn', 'Hạn sử dụng']);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
      cell.alignment = { horizontal: 'center' };
    });

    ws.getColumn(1).width = 8;
    ws.getColumn(2).width = 22;
    ws.getColumn(3).width = 16;
    ws.getColumn(4).width = 12;
    ws.getColumn(5).width = 12;
    ws.getColumn(6).width = 18;

    // Data rows
    batch.codes.forEach((code, idx) => {
      const isExpired = code.expiresAt && code.expiresAt < new Date();
      const status = !code.isActive ? 'Vô hiệu'
        : isExpired ? 'Hết hạn'
        : code.usedCount >= code.usageLimit ? 'Hết lượt'
        : 'Chưa dùng';

      const row = ws.addRow([
        idx + 1,
        code.code,
        status,
        code.usedCount,
        code.usageLimit,
        code.expiresAt ? code.expiresAt.toLocaleDateString('vi-VN') : 'Không giới hạn',
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' },
        };
      });
    });

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async getBatchRedemptions(id: string, page = 1, limit = 20) {
    const batch = await this.prisma.codeBatch.findUnique({ where: { id } });
    if (!batch) throw new NotFoundException('Không tìm thấy lô mã');

    const skip = (page - 1) * limit;
    const codeIds = (
      await this.prisma.exchangeCode.findMany({
        where: { batchId: id },
        select: { id: true },
      })
    ).map(c => c.id);

    const [data, total] = await Promise.all([
      this.prisma.exchangeRedeem.findMany({
        skip,
        take: limit,
        where: { codeId: { in: codeIds } },
        include: {
          code: { select: { code: true, rewardType: true, rewardValue: true } },
          user: { select: { id: true, email: true, firstName: true, lastName: true, nickname: true } },
        },
        orderBy: { redeemedAt: 'desc' },
      }),
      this.prisma.exchangeRedeem.count({ where: { codeId: { in: codeIds } } }),
    ]);

    return {
      data: data.map(r => ({
        id: r.id,
        code: r.code.code,
        rewardType: r.code.rewardType,
        rewardValue: r.code.rewardValue,
        userId: r.userId,
        userNickname: r.user?.nickname || r.user?.email || r.userId,
        ipAddress: r.ipAddress,
        deviceType: r.userAgent,
        redeemedAt: r.redeemedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}