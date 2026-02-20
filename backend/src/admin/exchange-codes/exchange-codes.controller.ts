import { Controller, Get, Post, Body, Query, UseGuards, Param, Res, Put, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExchangeCodesService } from './exchange-codes.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateExchangeCodeDto } from './dto/exchange-code.dto';
import { CreateCodeBatchDto, DeactivateCodeBatchDto } from './dto/create-code-batch.dto';
import { AdminRole } from '@prisma/client';

@ApiTags('exchange-codes')
@Controller('exchange-codes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ExchangeCodesController {
  constructor(private readonly service: ExchangeCodesService) {}

  @Post('redeem')
  @ApiOperation({ summary: 'Nhập mã đổi thưởng' })
  async redeem(@CurrentUser('id') userId: string, @Body('code') code: string) {
    return this.service.redeem(userId, code);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tạo mã đổi thưởng (Admin)' })
  async create(@Body() dto: CreateExchangeCodeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sửa mã đổi thưởng (Admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: CreateExchangeCodeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Danh sách mã (Admin) - tìm theo mã hoặc batch' })
  async findAll(
    @Query('page') page = 1, 
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('rewardType') rewardType?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll(+page, +limit, { search, rewardType, isActive });
  }

  // BATCH MANAGEMENT ENDPOINTS

  @Post('batches')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tạo lô mã hàng loạt (Admin)' })
  async createBatch(@Body() dto: CreateCodeBatchDto, @CurrentUser('id') userId: string) {
    if (!userId) {
      throw new Error('Không tìm thấy người dùng');
    }
    dto.createdBy = userId;
    return this.service.createBatch(dto);
  }

  @Get('batches')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Danh sách lô mã (Admin)' })
  async getBatches(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('rewardType') rewardType?: string,
    @Query('isActive') isActive?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.findAllBatches(+page, +limit, {
      search,
      rewardType,
      isActive,
      dateFrom,
      dateTo,
    });
  }

  @Get('batches/:id')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Chi tiết lô mã (Admin)' })
  async getBatch(@Param('id') id: string) {
    return this.service.findBatchById(id);
  }

  @Post('batches/:id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Vô hiệu hóa lô mã (Admin)' })
  async deactivateBatch(@Param('id') id: string, @Body() dto: DeactivateCodeBatchDto) {
    return this.service.deactivateBatch(id, dto);
  }

  @Get('batches/:id/export')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xuất Excel lô mã (Admin)' })
  async exportBatch(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.service.exportBatchToExcel(id);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ma-doi-qua-${id}-${Date.now()}.xlsx"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('batches/:id/redemptions')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lịch sử đổi mã của lô (Admin)' })
  async getBatchRedemptions(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.getBatchRedemptions(id, +page, +limit);
  }
}
