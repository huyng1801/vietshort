import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

@Injectable()
export class VnpayProvider {
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly url: string;
  private readonly returnUrl: string;

  constructor(private configService: ConfigService) {
    this.tmnCode = this.configService.get('payment.vnpay.tmnCode') || '';
    this.hashSecret = this.configService.get('payment.vnpay.hashSecret') || '';
    this.url = this.configService.get('payment.vnpay.url') || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.returnUrl = this.configService.get('payment.vnpay.returnUrl') || '';
  }

  createPaymentUrl(orderId: string, amount: number, description: string, ipAddress: string): string {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000));

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: description,
      vnp_OrderType: 'other',
      vnp_Amount: (amount * 100).toString(),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sortedParams = this.sortObject(params);
    const signData = querystring.stringify(sortedParams, '&', '=');
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sortedParams['vnp_SecureHash'] = signed;

    return `${this.url}?${querystring.stringify(sortedParams, '&', '=')}`;
  }

  verifyCallback(params: Record<string, string>): boolean {
    const secureHash = params['vnp_SecureHash'];
    const { vnp_SecureHash, vnp_SecureHashType, ...rest } = params;

    const sortedParams = this.sortObject(rest);
    const signData = querystring.stringify(sortedParams, '&', '=');
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const computed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === computed;
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    return Object.keys(obj).sort().reduce((result: any, key) => {
      result[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
      return result;
    }, {});
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }
}
