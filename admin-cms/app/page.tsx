'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { Row, Col, Typography, Spin } from 'antd';
import dynamic from 'next/dynamic';
import {
  VideoCameraOutlined,
  UserOutlined,
  DollarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { DashboardStats } from '@/types';

// Lazy load heavy dashboard components
const StatCard = dynamic(() => import('@/components/dashboard/StatCard'), { ssr: false });
const ChartWidget = dynamic(() => import('@/components/dashboard/ChartWidget'), { ssr: false, loading: () => <Spin /> });
const RecentActivity = dynamic(() => import('@/components/dashboard/RecentActivity'), { ssr: false });
const TopVideos = dynamic(() => import('@/components/dashboard/TopVideos'), { ssr: false });

const { Title } = Typography;

export default function HomePage() {
  const router = useRouter();
  const { isLoading } = useAdminAuth(false); // false = require auth
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Check auth - redirect to login if not authenticated
  // Removed: allow unauthenticated access

  // Load dashboard stats
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Debug: Check token before dashboard call
        const token = localStorage.getItem('admin_token');
        console.log('📊 Dashboard - Token check:', token ? 'FOUND' : 'MISSING');
        
        const res = await adminAPI.getDashboardStats();
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (!isLoading) {
      fetchDashboard();
    }
  }, [isLoading]);

  if (isLoading || statsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const content = (
    <div>
      <div className="page-header">
        <Title level={3}>Bảng điều khiển</Title>
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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <ChartWidget
            title="Lượt xem 7 ngày qua"
            data={stats?.viewsChart || []}
            type="area"
            dataKey="value"
            xAxisKey="date"
            color="#1890ff"
          />
        </Col>
        <Col xs={24} lg={8}>
          <RecentActivity activities={stats?.recentActivities || []} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <TopVideos videos={stats?.topVideos || []} />
        </Col>
      </Row>
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
}
