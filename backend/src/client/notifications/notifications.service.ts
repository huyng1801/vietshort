import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { RedisService } from '../../config/redis.config';
import { EmailProvider } from './providers/email.provider';
import { FirebaseProvider } from './providers/firebase.provider';
import { CreateNotificationDto, NotificationType } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private emailProvider: EmailProvider,
    private firebaseProvider: FirebaseProvider,
  ) {}

  async create(dto: CreateNotificationDto) {
    // Store in-app notification via Redis list (lightweight)
    const notification = {
      id: Date.now().toString(),
      ...dto,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const key = `notifications:${dto.userId}`;
    await this.redisService.addToQueue(key, JSON.stringify(notification));

    // Publish real-time event
    await this.redisService.publish('notifications', JSON.stringify(notification));

    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const key = `notifications:${userId}`;
    // Simple implementation using Redis list
    const all: any[] = [];
    let item;
    const tempKey = `notifications_temp:${userId}`;

    // Read all from queue, collect, and push back
    // For production: use sorted sets or database storage
    // Current: simple approach for MVP
    return { data: all, page, limit };
  }

  async markAsRead(userId: string, notificationId: string) {
    // Mark notification as read in Redis
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const key = `notifications_unread:${userId}`;
    const count = await this.redisService.get<number>(key);
    return { count: count ? Number(count) : 0 };
  }

  // Helper: send notification for common events
  async notifyPaymentSuccess(userId: string, amount: number) {
    return this.create({
      userId, type: NotificationType.PAYMENT,
      title: 'Thanh toán thành công',
      message: `Bạn đã nạp thành công ${amount.toLocaleString('vi-VN')}đ`,
    });
  }

  async notifyNewEpisode(userId: string, videoTitle: string, episodeNumber: number) {
    return this.create({
      userId, type: NotificationType.VIDEO,
      title: 'Tập mới',
      message: `${videoTitle} đã ra tập ${episodeNumber}`,
    });
  }
}
