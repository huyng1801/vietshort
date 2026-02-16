'use client';

import { Row, Col, Card, Statistic } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

interface AchievementsHeaderProps {
  loading: boolean;
  totalAchievements: number;
  totalUnlocked: number;
}

export default function AchievementsHeader({
  loading,
  totalAchievements,
  totalUnlocked,
}: AchievementsHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý thành tích</h1>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Tổng thành tích"
              value={totalAchievements}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Thành tích đã mở"
              value={totalUnlocked}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
