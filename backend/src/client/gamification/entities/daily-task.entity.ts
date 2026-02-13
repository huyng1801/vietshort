export interface DailyTaskEntity {
  id: string;
  name: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}

export interface DailyTaskConfig {
  taskId: string;
  name: string;
  description: string;
  targetCount: number;
  goldReward: number;
  isActive: boolean;
}
