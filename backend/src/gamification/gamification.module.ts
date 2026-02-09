import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { DailyCheckInController } from './daily-check-in.controller';
import { DailyCheckInService } from './daily-check-in.service';
import { DailyTasksController } from './daily-tasks.controller';
import { DailyTasksService } from './daily-tasks.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [AchievementsController, DailyCheckInController, DailyTasksController],
  providers: [AchievementsService, DailyCheckInService, DailyTasksService],
})
export class GamificationModule {}
