import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeCodesService } from './exchange-codes.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateExchangeCodeDto } from './dto/exchange-code.dto';
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
  @Roles(AdminRole.ADMIN)
  @ApiOperation({ summary: 'Tạo mã đổi thưởng (Admin)' })
  async create(@Body() dto: CreateExchangeCodeDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(AdminRole.ADMIN)
  @ApiOperation({ summary: 'Danh sách mã (Admin)' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.findAll(+page, +limit);
  }
}
