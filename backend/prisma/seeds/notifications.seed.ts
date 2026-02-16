import { PrismaClient, NotificationType, NotificationChannel } from '@prisma/client';

export async function seedNotifications(prisma: PrismaClient, users: any[]) {
  console.log('🔔 Creating sample notifications...');

  const [user1, user2, user3] = users;

  const notifications = [
    {
      userId: user1.id,
      type: NotificationType.NEW_EPISODE,
      title: 'Tập mới đã ra mắt!',
      content: 'Phàm Công Chi Lộ - Tập 6 đã có sẵn để xem',
      targetType: 'episode',
      targetId: 'ep_6_video1',
      channel: NotificationChannel.PUSH,
      isRead: false,
    },
    {
      userId: user1.id,
      type: NotificationType.PROMOTION,
      title: 'Khuyến mãi VIP Gold',
      content: 'Giảm 20% khi mua gói VIP Gold 3 tháng - Chỉ còn 2 ngày!',
      targetType: 'promotion',
      targetId: 'promo_vip20off',
      channel: NotificationChannel.PUSH,
      isRead: true,
    },
    {
      userId: user2.id,
      type: NotificationType.SYSTEM,
      title: 'Điểm danh để nhận thưởng',
      content: 'Đừng quên điểm danh hàng ngày để nhận vàng miễn phí!',
      targetType: 'checkin',
      channel: NotificationChannel.PUSH,
      isRead: false,
    },
    {
      userId: user3.id,
      type: NotificationType.VIP_EXPIRING,
      title: 'VIP sắp hết hạn',
      content: 'Gói VIP Gold của bạn sẽ hết hạn trong 7 ngày nữa',
      targetType: 'vip',
      channel: NotificationChannel.EMAIL,
      isRead: false,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log('✅ Notifications created\n');
}
