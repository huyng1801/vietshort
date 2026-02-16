'use client';

import { memo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { CalendarOutlined, GoldOutlined } from '@ant-design/icons';

interface CheckInStats {
  totalCheckIns: number;
  todayCheckIns: number;
  weekCheckIns: number;
  totalGoldGiven: number;
}

interface CheckInRewardsHeaderProps {
  loading: boolean;
  stats: CheckInStats | null;
}

export default memo(function CheckInRewardsHeader({ loading, stats }: CheckInRewardsHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý điểm danh - Phần thưởng</h1>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small" loading={loading} style={{ minHeight: 100 }}>
            <Statistic
              title="Tổng điểm danh"
              value={stats?.totalCheckIns || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" loading={loading} style={{ minHeight: 100 }}>
            <Statistic
              title="Hôm nay"
              value={stats?.todayCheckIns || 0}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" loading={loading} style={{ minHeight: 100 }}>
            <Statistic
              title="Tuần này"
              value={stats?.weekCheckIns || 0}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" loading={loading} style={{ minHeight: 100 }}>
            <Statistic
              title="Tổng vàng đã phát"
              value={stats?.totalGoldGiven || 0}
              prefix={<GoldOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
});
