import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';
import { VnpayProvider } from './providers/vnpay.provider';
import { MomoProvider } from './providers/momo.provider';
import { FraudDetectionService } from './fraud-detection.service';
import { TransactionIntegrityService } from './transaction-integrity.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VnpayCallbackDto, MomoCallbackDto } from './dto/payment-callback.dto';
import { TransactionStatus, TransactionType, PaymentProvider } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private vnpayProvider: VnpayProvider,
    private momoProvider: MomoProvider,
    private fraudDetection: FraudDetectionService,
    private transactionIntegrity: TransactionIntegrityService,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto, ipAddress: string) {
    // Fraud detection check
    const fraudCheck = await this.fraudDetection.checkSuspiciousActivity(userId, dto.amount, ipAddress);
    if (fraudCheck.suspicious) {
      this.logger.warn(`Suspicious payment from user ${userId}: ${fraudCheck.reasons.join(', ')}`);
      // Still allow but flag the transaction
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        goldAmount: dto.goldAmount,
        vipDays: dto.vipDays,
        provider: dto.provider,
        description: dto.description || `Nạp ${dto.goldAmount || 0} gold`,
        status: TransactionStatus.PENDING,
      },
    });

    // Flag if suspicious
    if (fraudCheck.suspicious) {
      await this.fraudDetection.flagTransaction(transaction.id, fraudCheck.reasons.join('; '));
    }

    let paymentUrl: string;
    if (dto.provider === PaymentProvider.VNPAY) {
      paymentUrl = this.vnpayProvider.createPaymentUrl(
        transaction.id, dto.amount,
        transaction.description || 'VietShort payment', ipAddress,
      );
    } else if (dto.provider === PaymentProvider.MOMO) {
      const result: any = await this.momoProvider.createPayment(
        transaction.id, dto.amount,
        transaction.description || 'VietShort payment',
        `${process.env.FRONTEND_URL}/payment/callback`,
        `${process.env.API_URL}/api/v1/payment/momo/callback`,
      );
      paymentUrl = result.payUrl;
    } else {
      throw new BadRequestException('Provider không hỗ trợ');
    }

    return { transactionId: transaction.id, paymentUrl };
  }

  async handleVnpayCallback(params: VnpayCallbackDto) {
    if (!this.vnpayProvider.verifyCallback(params as any)) {
      throw new BadRequestException('Chữ ký VNPay không hợp lệ');
    }

    const transactionId = params.vnp_TxnRef;
    const isSuccess = params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00';

    return this.completeTransaction(transactionId, isSuccess, params.vnp_TxnRef);
  }

  async handleMomoCallback(data: MomoCallbackDto) {
    if (!this.momoProvider.verifyCallback(data as any)) {
      throw new BadRequestException('Chữ ký MoMo không hợp lệ');
    }

    const transactionId = data.orderId;
    const isSuccess = data.resultCode === 0;

    return this.completeTransaction(transactionId, isSuccess, data.orderId);
  }

  private async completeTransaction(transactionId: string, isSuccess: boolean, providerTxId: string) {
    // Idempotency check — prevent double processing
    const canProcess = await this.transactionIntegrity.ensureIdempotency(transactionId);
    if (!canProcess) {
      this.logger.warn(`Transaction ${transactionId} already processed, skipping`);
      return { message: 'Giao dịch đã được xử lý' };
    }

    const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) throw new NotFoundException('Giao dịch không tồn tại');
    if (transaction.status !== TransactionStatus.PENDING) return { message: 'Giao dịch đã xử lý' };

    if (isSuccess) {
      // Use distributed lock to prevent race conditions
      return this.transactionIntegrity.executeAtomicTransaction(
        async (tx) => {
          await tx.transaction.update({
            where: { id: transactionId },
            data: { status: TransactionStatus.COMPLETED, providerTxId, processedAt: new Date() },
          });

          // Credit gold
          if (transaction.goldAmount) {
            await tx.user.update({
              where: { id: transaction.userId },
              data: { goldBalance: { increment: transaction.goldAmount } },
            });
          }

          // Credit VIP
          if (transaction.vipDays) {
            const user = await tx.user.findUnique({ where: { id: transaction.userId } });
            const now = new Date();
            const currentExpiry = user?.vipExpiresAt && user.vipExpiresAt > now ? user.vipExpiresAt : now;
            const newExpiry = new Date(currentExpiry);
            newExpiry.setDate(newExpiry.getDate() + transaction.vipDays);

            await tx.user.update({
              where: { id: transaction.userId },
              data: { vipType: 'GOLD', vipExpiresAt: newExpiry },
            });
          }

          // Invalidate cache
          await this.redisService.del(`user:${transaction.userId}`);
          return { message: 'Thanh toán thành công' };
        },
        `tx_lock:${transactionId}`,
        30,
      );
    }

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.FAILED, providerTxId, processedAt: new Date() },
    });
    return { message: 'Thanh toán thất bại' };
  }

  async getUserTransactions(userId: string, page = 1, limit = 20) {
    return this.prisma.paginate('transaction', {
      page, limit,
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
