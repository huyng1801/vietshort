import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { WalletService } from '../../client/wallet/wallet.service';
import { VipService } from '../../client/vip/vip.service';
import { RewardType, VipType } from '@prisma/client';
import { CreateExchangeCodeDto } from './dto/exchange-code.dto';
import { CreateCodeBatchDto, DeactivateCodeBatchDto } from './dto/create-code-batch.dto';
import * as ExcelJS from 'exceljs';

/**
 * Service gộp chung cho Exchange Codes và Code Batches
 * Quản lý tạo mã, đổi mã, và quản lý lô mã hàng loạt
 */
@Injectable()
export class ExchangeCodesService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private vipService: VipService,
  ) {}

  // ==================== SINGLE CODE MANAGEMENT ====================

  async create(dto: CreateExchangeCodeDto) {
    return this.prisma.exchangeCode.create({
      data: {
        code: dto.code.toUpperCase(),
        batchName: dto.batchName || '',
        rewardType: dto.rewardType as RewardType,
        rewardValue: dto.rewardValue,
        usageLimit: dto.maxUses || 1,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdBy: dto.createdBy || '',
      },
    });
  }

  async update(id: string, dto: CreateExchangeCodeDto) {
    return this.prisma.exchangeCode.update({
      where: { id },
      data: {
        code: dto.code.toUpperCase(),
        batchName: dto.batchName || '',
        rewardType: dto.rewardType as RewardType,
        rewardValue: dto.rewardValue,
        usageLimit: dto.maxUses || 1,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async redeem(userId: string, code: string) {
    const exchangeCode = await this.prisma.exchangeCode.findUnique({
      where: { code: code.toUpperCase() },
    });
    
    if (!exchangeCode || !exchangeCode.isActive) {
      throw new NotFoundException('Mã không hợp lệ');
    }
    if (exchangeCode.expiresAt && exchangeCode.expiresAt < new Date()) {
      throw new BadRequestException('Mã đã hết hạn');
    }
    if (exchangeCode.usedCount >= exchangeCode.usageLimit) {
      throw new BadRequestException('Mã đã hết lượt sử dụng');
    }

    const existing = await this.prisma.exchangeRedeem.findUnique({
      where: { userId_codeId: { userId, codeId: exchangeCode.id } },
    });
    if (existing) {
      throw new BadRequestException('Bạn đã sử dụng mã này');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.exchangeRedeem.create({ data: { userId, codeId: exchangeCode.id } });
      await tx.exchangeCode.update({
        where: { id: exchangeCode.id },
        data: { usedCount: { increment: 1 } },
      });

      let reward: any = {};
      switch (exchangeCode.rewardType) {
        case RewardType.GOLD:
          await this.walletService.addGold(userId, exchangeCode.rewardValue, `Nhập mã: ${code}`);
          reward = { type: 'gold', amount: exchangeCode.rewardValue };
          break;
        case RewardType.VIP_DAYS:
          await this.vipService.activateVip(userId, VipType.VIP_FREEADS, exchangeCode.rewardValue);
          reward = { type: 'vip', days: exchangeCode.rewardValue };
          break;
      }

      return { success: true, reward };
    });
  }

  async findAll(page = 1, limit = 20, filters?: {
    search?: string;
    rewardType?: string;
    isActive?: string;
  }) {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search } },
        { batchName: { contains: filters.search } },
      ];
    }

    if (filters?.rewardType) {
      where.rewardType = filters.rewardType;
    }

    if (filters?.isActive !== undefined && filters?.isActive !== '') {
      where.isActive = filters.isActive === 'true';
    }

    return this.prisma.paginate('exchangeCode', {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== BATCH MANAGEMENT ====================

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

    if (!dto.createdBy) {
      throw new BadRequestException('Không tìm thấy thông tin người tạo');
    }

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
          createdBy: dto.createdBy!, // Non-null assertion vì đã validate ở trên
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
          createdBy: dto.createdBy!, // Non-null assertion vì đã validate ở trên
        })),
      });

      return { ...batch, codes };
    });
  }

  async findAllBatches(
    page = 1,
    limit = 20,
    filters?: {
      search?: string;
      rewardType?: string;
      isActive?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // MySQL không hỗ trợ mode: 'insensitive', dùng contains thông thường
    if (filters?.search && filters.search.trim()) {
      where.OR = [
        { batchName: { contains: filters.search } },
        { codePrefix: { contains: filters.search } },
      ];
    }

    if (filters?.rewardType && filters.rewardType.trim()) {
      where.rewardType = filters.rewardType;
    }

    if (filters?.isActive !== undefined && filters.isActive !== null && filters.isActive !== '') {
      where.isActive = filters.isActive === 'true';
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(`${filters.dateFrom}T00:00:00Z`);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(`${filters.dateTo}T23:59:59Z`);
      }
    }

    const [batches, total] = await Promise.all([
      this.prisma.codeBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.codeBatch.count({ where }),
    ]);

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
    if (!batch) {
      throw new NotFoundException('Không tìm thấy lô mã');
    }
    if (!batch.isActive) {
      throw new BadRequestException('Lô mã đã được vô hiệu hóa');
    }

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

    if (!batch) {
      throw new NotFoundException('Không tìm thấy lô mã');
    }

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
    if (!batch) {
      throw new NotFoundException('Không tìm thấy lô mã');
    }

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
