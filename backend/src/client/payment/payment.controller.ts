import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VnpayCallbackDto, MomoCallbackDto } from './dto/payment-callback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { Public, CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Tạo thanh toán' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreatePaymentDto, @Req() req: Request) {
    return this.paymentService.createPayment(userId, dto, req.ip || '127.0.0.1');
  }

  @Public()
  @Get('vnpay/callback')
  @ApiOperation({ summary: 'VNPay IPN callback' })
  async vnpayCallback(@Query() params: VnpayCallbackDto) {
    return this.paymentService.handleVnpayCallback(params);
  }

  @Public()
  @Post('momo/callback')
  @ApiOperation({ summary: 'MoMo IPN callback' })
  async momoCallback(@Body() data: MomoCallbackDto) {
    return this.paymentService.handleMomoCallback(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Lịch sử giao dịch' })
  async history(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentService.getUserTransactions(userId, page, limit);
  }
}
