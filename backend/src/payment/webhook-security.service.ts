import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSecurityService {
  constructor(private configService: ConfigService) {}

  verifyVnpaySignature(params: Record<string, string>): boolean {
    const hashSecret = this.configService.get('VNPAY_HASH_SECRET');
    if (!hashSecret) throw new BadRequestException('VNPay chưa cấu hình');

    const secureHash = params['vnp_SecureHash'];
    const sortedParams = Object.keys(params)
      .filter((k) => k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType')
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    const hash = crypto.createHmac('sha512', hashSecret).update(sortedParams).digest('hex');
    return hash.toUpperCase() === secureHash?.toUpperCase();
  }

  verifyMomoSignature(data: Record<string, any>): boolean {
    const secretKey = this.configService.get('MOMO_SECRET_KEY');
    if (!secretKey) throw new BadRequestException('MoMo chưa cấu hình');

    const { signature, ...params } = data;
    const rawData = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
    const hash = crypto.createHmac('sha256', secretKey).update(rawData).digest('hex');
    return hash === signature;
  }

  generateRequestSignature(data: Record<string, any>, secret: string): string {
    const sorted = Object.keys(data).sort().map((k) => `${k}=${data[k]}`).join('&');
    return crypto.createHmac('sha256', secret).update(sorted).digest('hex');
  }
}
