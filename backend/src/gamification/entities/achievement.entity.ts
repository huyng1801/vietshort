export interface AchievementEntity {
  id: string;
  name: string;
  description: string;
  reward: number;
  claimed: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  userId: string;
  progress: number;
  target: number;
  completedAt?: Date;
}
