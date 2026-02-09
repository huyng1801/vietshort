export interface DailyCheckInEntity {
  id: string;
  userId: string;
  date: Date;
  day: number;
  reward: string;
  createdAt: Date;
}
