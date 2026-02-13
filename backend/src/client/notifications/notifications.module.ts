import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailProvider } from './providers/email.provider';
import { FirebaseProvider } from './providers/firebase.provider';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailProvider, FirebaseProvider],
  exports: [NotificationsService, EmailProvider],
})
export class NotificationsModule {}
