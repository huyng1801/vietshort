'use client';

import { useEffect, useState, useCallback } from 'react';
import { Row, Col, Typography, Spin, Badge, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import {
  VideoCameraOutlined,
  UserOutlined,
  DollarOutlined,
  EyeOutlined,
  WifiOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import type { DashboardStats, RecentActivityItem } from '@/types';

// Lazy load heavy dashboard components
const StatCard = dynamic(() => import('@/components/dashboard/StatCard'), { ssr: false });
const ChartWidget = dynamic(() => import('@/components/dashboard/ChartWidget'), { ssr: false, loading: () => <Spin /> });
const RecentActivity = dynamic(() => import('@/components/dashboard/RecentActivity'), { ssr: false });
const TopVideos = dynamic(() => import('@/components/dashboard/TopVideos'), { ssr: false });

const { Text } = Typography;

// Auto-refresh interval: 60 seconds
const REFRESH_INTERVAL = 60_000;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDashboard = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentActivity(10),
      ]);
      setStats(statsRes.data);
      setActivities(Array.isArray(activityRes.data) ? activityRes.data : []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket realtime: listen for dashboard updates
  const { connected } = useAdminSocket({
    onDashboardUpdate: (data) => {
      setStats((prev) => (prev ? { ...prev, ...data } : prev));
      setLastRefresh(new Date());
    },
    onNewActivity: (activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 15));
    },
  });

  // Initial fetch
  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => fetchDashboard(false), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold m-0">Bảng điều khiển</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tooltip title={connected ? 'Đang kết nối realtime' : 'Không có kết nối realtime'}>
            <Badge status={connected ? 'success' : 'default'} text={<Text type="secondary" style={{ fontSize: 12 }}><WifiOutlined /> {connected ? 'Live' : 'Offline'}</Text>} />
          </Tooltip>
          <Tooltip title="Làm mới dữ liệu">
            <ReloadOutlined onClick={() => fetchDashboard(false)} style={{ cursor: 'pointer', fontSize: 16, color: '#1890ff' }} />
          </Tooltip>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
          </Text>
        </div>
      </div>

      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng video"
            value={stats?.totalVideos || 0}
            icon={<VideoCameraOutlined />}
            color="#1890ff"
            growthRate={stats?.videoGrowthRate}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Người dùng"
            value={stats?.totalUsers || 0}
            icon={<UserOutlined />}
            color="#52c41a"
            growthRate={stats?.userGrowthRate}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Lượt xem hôm nay"
            value={stats?.viewsToday || 0}
            icon={<EyeOutlined />}
            color="#faad14"
            growthRate={stats?.viewGrowthRate}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Doanh thu tháng"
            value={stats?.revenueToday || 0}
            icon={<DollarOutlined />}
            color="#f5222d"
            prefix="₫"
            growthRate={stats?.revenueGrowthRate}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <ChartWidget
            title="Lượt xem 7 ngày qua"
            data={stats?.viewsChart || []}
            type="area"
            dataKey="value"
            xAxisKey="date"
            color="#1890ff"
            height={300}
          />
        </Col>
        <Col xs={24} lg={8}>
          <TopVideos videos={stats?.topVideos || []} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ChartWidget
            title="Doanh thu 7 ngày qua"
            data={stats?.revenueChart || []}
            type="bar"
            dataKey="value"
            xAxisKey="date"
            color="#52c41a"
            height={300}
          />
        </Col>
        <Col xs={24} lg={12}>
          <RecentActivity activities={activities.length > 0 ? activities : (stats?.recentActivities || [])} />
        </Col>
      </Row>
    </div>
  );
}
