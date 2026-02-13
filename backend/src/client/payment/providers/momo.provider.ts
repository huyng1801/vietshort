import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MomoProvider {
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;

  constructor(private configService: ConfigService) {
    this.partnerCode = this.configService.get('payment.momo.partnerCode') || '';
    this.accessKey = this.configService.get('payment.momo.accessKey') || '';
    this.secretKey = this.configService.get('payment.momo.secretKey') || '';
    this.endpoint = this.configService.get('payment.momo.endpoint') || 'https://test-payment.momo.vn/v2/gateway/api/create';
  }

  async createPayment(orderId: string, amount: number, description: string, returnUrl: string, notifyUrl: string) {
    const requestId = `${orderId}_${Date.now()}`;
    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${amount}`,
      `extraData=`,
      `ipnUrl=${notifyUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${description}`,
      `partnerCode=${this.partnerCode}`,
      `redirectUrl=${returnUrl}`,
      `requestId=${requestId}`,
      `requestType=payWithMethod`,
    ].join('&');

    const signature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');

    const body = {
      partnerCode: this.partnerCode,
      partnerName: 'VietShort',
      requestId,
      amount,
      orderId,
      orderInfo: description,
      redirectUrl: returnUrl,
      ipnUrl: notifyUrl,
      requestType: 'payWithMethod',
      extraData: '',
      lang: 'vi',
      signature,
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return response.json();
  }

  verifyCallback(data: Record<string, any>): boolean {
    const { signature, ...rest } = data;
    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${rest.amount}`,
      `extraData=${rest.extraData || ''}`,
      `message=${rest.message}`,
      `orderId=${rest.orderId}`,
      `orderInfo=${rest.orderInfo}`,
      `orderType=${rest.orderType}`,
      `partnerCode=${rest.partnerCode}`,
      `payType=${rest.payType}`,
      `requestId=${rest.requestId}`,
      `responseTime=${rest.responseTime}`,
      `resultCode=${rest.resultCode}`,
      `transId=${rest.transId}`,
    ].join('&');

    const computed = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex');
    return signature === computed;
  }
}
