'use client';

import { memo } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { CommentOutlined, WarningOutlined } from '@ant-design/icons';
import type { CommentStats } from '@/types';

interface CommentsHeaderProps {
  stats: CommentStats | null;
  loading?: boolean;
}

export default memo(function CommentsHeader({ stats, loading }: CommentsHeaderProps) {
  if (!stats) return null;

  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={12} sm={6}>
        <Card loading={loading} size="small" style={{ minHeight: 100 }}>
          <Statistic title="Tổng bình luận" value={stats.total} prefix={<CommentOutlined />} />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card loading={loading} size="small" style={{ minHeight: 100 }}>
          <Statistic title="Đã duyệt" value={stats.approved} styles={{ content: { color: '#52c41a' } }} />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card loading={loading} size="small" style={{ minHeight: 100 }}>
          <Statistic title="Chờ duyệt" value={stats.pending} styles={{ content: { color: '#faad14' } }} />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card loading={loading} size="small" style={{ minHeight: 100 }}>
          <Statistic title="Bị báo cáo" value={stats.reported} styles={{ content: { color: '#ff4d4f' } }} prefix={<WarningOutlined />} />
        </Card>
      </Col>
    </Row>
  );
});
