export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  userGrowthRate: number;
  totalVideos: number;
  publishedVideos: number;
  videoGrowthRate: number;
  totalViews: number;
  viewsToday: number;
  viewGrowthRate: number;
  totalRevenue: number;
  revenueToday: number;
  revenueGrowthRate: number;
  activeVipUsers: number;
  vipGrowthRate: number;
  onlineUsers: number;
  encodingQueue: number;
  // Chart data
  viewsChart?: ChartDataPoint[];
  revenueChart?: ChartDataPoint[];
  // Top content
  topVideos?: TopVideo[];
  recentActivities?: RecentActivityItem[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  [key: string]: unknown;
}

export interface RevenueData {
  date: string;
  vnpay: number;
  momo: number;
  iap: number;
  total: number;
}

export interface TopVideo {
  id: string;
  title: string;
  thumbnailUrl?: string;
  viewCount: number;
  likeCount: number;
  revenue: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'user_register' | 'video_upload' | 'payment' | 'vip_purchase' | 'report';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
}
