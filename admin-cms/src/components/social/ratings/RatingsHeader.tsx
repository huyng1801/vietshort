'use client';

import { memo } from 'react';
import { Row, Col, Card, Statistic, Progress, Tag, Tooltip, Typography } from 'antd';
import { StarOutlined, StarFilled, TrophyOutlined } from '@ant-design/icons';
import type { RatingStats } from '@/types';

const { Text } = Typography;

// Use a single color for all stars in the distribution
const STAR_COLOR = '#fadb14';

interface RatingsHeaderProps {
  stats: RatingStats | null;
  loading?: boolean;
}

export default memo(function RatingsHeader({ stats, loading }: RatingsHeaderProps) {
  if (!stats) return null;

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card loading={loading} size="small" style={{ minHeight: 120 }}>
            <Statistic
              title="Tổng đánh giá"
              value={stats.total || 0}
              prefix={<StarOutlined />}
              styles={{ content: { fontSize: 24, fontWeight: 600, marginTop: 16 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card loading={loading} size="small" style={{ minHeight: 120 }}>
            <Statistic
              title="Trung bình"
              value={stats.averageRating || 0}
              precision={1}
              suffix="/ 5"
              prefix={<StarFilled style={{ color: '#fadb14' }} />}
              styles={{ content: { fontSize: 24, fontWeight: 600, marginTop: 16 } }}
            />
          </Card>
        </Col>
       
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card loading={loading} size="small" title={<span className="font-semibold">Phân bố đánh giá</span>}>
            <div className="space-y-3">
              {stats.distribution?.map((d) => {
                const percent = stats.totalRatings > 0 ? Math.round((d.count / stats.totalRatings) * 100) : 0;
                return (
                  <div key={d.star} className="flex items-center gap-3">
                    <div className="w-12 flex items-center gap-1">
                      <Text className="font-semibold">{d.star}</Text>
                      <StarFilled style={{ color: STAR_COLOR, fontSize: 14 }} />
                    </div>
                    <Progress
                      percent={percent}
                      size="small"
                      className="flex-1 mb-0"
                      strokeColor={STAR_COLOR}
                      format={() => `${d.count}`}
                    />
                    <Text type="secondary" className="text-xs w-8 text-right">{percent}%</Text>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
});
