'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Row, Col, DatePicker, Button, Space, Select, message, Statistic, Spin, Table, Tag } from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  DollarOutlined,
  UserOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import adminAPI from '@/lib/admin-api';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import { formatCurrency, formatNumber } from '@/lib/admin-utils';
import dayjs from 'dayjs';

const ViewsChart = dynamic(() => import('@/components/analytics/ViewsChart'), { ssr: false, loading: () => <Spin /> });
const RevenueChart = dynamic(() => import('@/components/analytics/RevenueChart'), { ssr: false, loading: () => <Spin /> });
const UserGrowthChart = dynamic(() => import('@/components/analytics/UserGrowthChart'), { ssr: false, loading: () => <Spin /> });
const TopVideosChart = dynamic(() => import('@/components/analytics/TopVideosChart'), { ssr: false, loading: () => <Spin /> });

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ReportType = 'overview' | 'views' | 'revenue' | 'users';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('overview');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  // Data states
  const [overviewData, setOverviewData] = useState<any>(null);
  const [viewsData, setViewsData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);

  // WebSocket for realtime updates
  const { connected } = useAdminSocket({
    onAnalyticsUpdate: (data) => {
      if (data.views && viewsData) setViewsData((prev: any) => ({ ...prev, ...data.views }));
      if (data.revenue && revenueData) setRevenueData((prev: any) => ({ ...prev, ...data.revenue }));
    },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { days };

      if (reportType === 'overview') {
        const [overview, views, revenue, users] = await Promise.all([
          adminAPI.getAnalyticsOverview(params),
          adminAPI.getViewsAnalytics(params),
          adminAPI.getRevenueAnalytics(params),
          adminAPI.getUserAnalytics(params),
        ]);
        setOverviewData(overview.data);
        setViewsData(views.data);
        setRevenueData(revenue.data);
        setUsersData(users.data);
      } else if (reportType === 'views') {
        const res = await adminAPI.getViewsAnalytics(params);
        setViewsData(res.data);
      } else if (reportType === 'revenue') {
        const res = await adminAPI.getRevenueAnalytics(params);
        setRevenueData(res.data);
      } else if (reportType === 'users') {
        const res = await adminAPI.getUserAnalytics(params);
        setUsersData(res.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      message.error('Không thể tải dữ liệu phân tích');
    } finally {
      setLoading(false);
    }
  }, [reportType, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    message.info('Đang chuẩn bị xuất báo cáo...');
    // TODO: implement CSV export
  };

  const renderOverview = () => (
    <>
      {/* Summary stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng lượt xem"
              value={overviewData?.totalViews || viewsData?.totalViews || 0}
              prefix={<EyeOutlined />}
              formatter={(v) => formatNumber(v as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={revenueData?.byProvider?.total || 0}
              prefix={<DollarOutlined />}
              formatter={(v) => formatCurrency(v as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng mới"
              value={overviewData?.newUsers || usersData?.newUsersInPeriod || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng hoạt động"
              value={usersData?.activeUsers || 0}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ViewsChart data={viewsData?.chart || []} loading={loading} />
        </Col>
        <Col xs={24} lg={12}>
          <RevenueChart data={revenueData?.chart || []} loading={loading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <UserGrowthChart data={usersData?.chart || []} loading={loading} />
        </Col>
        <Col xs={24} lg={12}>
          <TopVideosChart data={viewsData?.topVideos || []} loading={loading} />
        </Col>
      </Row>

      {/* VIP Distribution */}
      {usersData?.vipDistribution && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Phân bổ gói VIP">
              <Table
                dataSource={usersData.vipDistribution}
                columns={[
                  {
                    title: 'Gói',
                    dataIndex: 'tier',
                    key: 'tier',
                    render: (tier: string) => (
                      <Tag color={tier === 'FREE' ? 'default' : tier === 'SILVER' ? 'blue' : 'gold'}>
                        {tier}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'count',
                    key: 'count',
                    render: (v: number) => formatNumber(v),
                  },
                ]}
                pagination={false}
                size="small"
                rowKey="tier"
              />
            </Card>
          </Col>
        </Row>
      )}
    </>
  );

  const renderViews = () => (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <ViewsChart data={viewsData?.chart || []} loading={loading} />
      </Col>
      <Col span={24}>
        <TopVideosChart data={viewsData?.topVideos || []} loading={loading} />
      </Col>
    </Row>
  );

  const renderRevenue = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="VNPay" value={revenueData?.byProvider?.vnpay || 0} formatter={(v) => formatCurrency(v as number)} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="MoMo" value={revenueData?.byProvider?.momo || 0} formatter={(v) => formatCurrency(v as number)} valueStyle={{ color: '#d6249f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="IAP" value={revenueData?.byProvider?.iap || 0} formatter={(v) => formatCurrency(v as number)} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <RevenueChart data={revenueData?.chart || []} loading={loading} />
        </Col>
      </Row>
    </>
  );

  const renderUsers = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Tổng người dùng" value={usersData?.totalUsers || 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Người dùng mới" value={usersData?.newUsersInPeriod || 0} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Đang hoạt động (7 ngày)" value={usersData?.activeUsers || 0} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <UserGrowthChart data={usersData?.chart || []} loading={loading} />
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <Title level={3} style={{ margin: 0 }}>Báo cáo & Phân tích</Title>
        <Space wrap>
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 180 }}
            options={[
              { label: 'Tổng quan', value: 'overview' },
              { label: 'Lượt xem', value: 'views' },
              { label: 'Doanh thu', value: 'revenue' },
              { label: 'Người dùng', value: 'users' },
            ]}
          />
          <Select
            value={days}
            onChange={setDays}
            style={{ width: 140 }}
            options={[
              { label: '7 ngày', value: 7 },
              { label: '14 ngày', value: 14 },
              { label: '30 ngày', value: 30 },
              { label: '90 ngày', value: 90 },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất báo cáo
          </Button>
          {connected && <Tag color="green">Live</Tag>}
        </Space>
      </div>

      {reportType === 'overview' && renderOverview()}
      {reportType === 'views' && renderViews()}
      {reportType === 'revenue' && renderRevenue()}
      {reportType === 'users' && renderUsers()}
    </div>
  );
}
