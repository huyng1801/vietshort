import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  constructor(private configService: ConfigService) {}

  async sendMail(to: string, subject: string, html: string) {
    const emailConfig = this.configService.get('email');
    if (!emailConfig?.host) {
      this.logger.warn(`Email not configured. Would send to: ${to}, subject: ${subject}`);
      return;
    }

    // TODO: Integrate with nodemailer or SendGrid when email service is configured
    this.logger.log(`Email sent to: ${to}, subject: ${subject}`);
  }

  async sendPasswordReset(to: string, resetLink: string) {
    return this.sendMail(to, 'Đặt lại mật khẩu - VietShort', `
      <h2>Đặt lại mật khẩu</h2>
      <p>Nhấn vào link sau để đặt lại mật khẩu:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link có hiệu lực trong 1 giờ.</p>
    `);
  }

  async sendWelcome(to: string, name: string) {
    return this.sendMail(to, 'Chào mừng đến với VietShort!', `
      <h2>Xin chào ${name}!</h2>
      <p>Cảm ơn bạn đã đăng ký VietShort. Hãy bắt đầu khám phá kho phim ngắn của chúng tôi.</p>
    `);
  }
}
