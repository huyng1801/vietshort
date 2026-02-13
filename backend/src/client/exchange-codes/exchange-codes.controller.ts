import { Controller, Get, Post, Body, Query, UseGuards, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExchangeCodesService } from './exchange-codes.service';
import { CodeBatchService } from './code-batch.service';
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
  constructor(
    private readonly service: ExchangeCodesService,
    private readonly batchService: CodeBatchService,
  ) {}

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

  @Get()
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Danh sách mã (Admin)' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.findAll(+page, +limit);
  }

  // BATCH MANAGEMENT ENDPOINTS

  @Post('batches')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tạo lô mã hàng loạt (Admin)' })
  async createBatch(@Body() dto: CreateCodeBatchDto, @CurrentUser('id') userId: string) {
    dto.createdBy = userId;
    return this.batchService.createBatch(dto);
  }

  @Get('batches')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Danh sách lô mã (Admin)' })
  async getBatches(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.batchService.findAllBatches(+page, +limit);
  }

  @Get('batches/:id')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Chi tiết lô mã (Admin)' })
  async getBatch(@Param('id') id: string) {
    return this.batchService.findBatchById(id);
  }

  @Post('batches/:id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Vô hiệu hóa lô mã (Admin)' })
  async deactivateBatch(@Param('id') id: string, @Body() dto: DeactivateCodeBatchDto) {
    return this.batchService.deactivateBatch(id, dto);
  }

  @Get('batches/:id/export')
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xuất Excel lô mã (Admin)' })
  async exportBatch(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.batchService.exportBatchToExcel(id);
    
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
    return this.batchService.getBatchRedemptions(id, +page, +limit);
  }
}
