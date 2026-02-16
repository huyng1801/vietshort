'use client';

import { Row, Col, Card, Statistic } from 'antd';
import { FireOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface DailyTasksHeaderProps {
  loading: boolean;
  activeTasks: number;
  totalTasks: number;
  todayCompletions: number;
}

export default function DailyTasksHeader({
  loading,
  activeTasks,
  totalTasks,
  todayCompletions,
}: DailyTasksHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý nhiệm vụ hằng ngày</h1>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Nhiệm vụ đang hoạt động"
              value={activeTasks}
              suffix={`/ ${totalTasks}`}
              prefix={<FireOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Tổng nhiệm vụ"
              value={totalTasks}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Hoàn thành hôm nay"
              value={todayCompletions}
              prefix={<CheckCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
