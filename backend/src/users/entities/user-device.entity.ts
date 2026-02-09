export interface UserDeviceEntity {
  id: string;
  userId: string;
  deviceId: string;
  platform: 'web' | 'ios' | 'android';
  deviceName?: string;
  pushToken?: string;
  lastActive: Date;
  createdAt: Date;
}
