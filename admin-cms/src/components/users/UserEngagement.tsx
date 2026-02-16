'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography, Divider, Space } from 'antd';
import {
  PlayCircleOutlined,
  UnlockOutlined,
  CalendarOutlined,
  HeartOutlined,
  DollarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  StarOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { UserEngagementStats } from '@/types';
import { formatNumber, formatDuration } from '@/lib/admin-utils';

interface UserEngagementProps {
  userId: string;
}

export default function UserEngagement({ userId }: UserEngagementProps) {
  const [stats, setStats] = useState<UserEngagementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getUserEngagement(userId);
        setStats(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId]);

  if (loading) return <Spin />;
  if (!stats) return <Typography.Text type="secondary">Không có dữ liệu</Typography.Text>;

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      {/* Watch Stats */}
      <Card size="small" title={<><PlayCircleOutlined /> Xem phim</>}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Tổng thời gian xem"
              value={formatDuration(stats.watch?.totalWatchTime ?? 0)}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Số lần xem"
              value={stats.watch?.totalWatchCount ?? 0}
              prefix={<EyeOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Hoàn thành"
              value={stats.watch?.completedCount ?? 0}
              suffix={`/ ${stats.watch?.totalWatchCount ?? 0}`}
            />
          </Col>
        </Row>
      </Card>

      {/* Unlock Stats */}
      <Card size="small" title={<><UnlockOutlined /> Giải khóa</>}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="Tổng giải khóa" value={stats.unlock?.totalUnlocks ?? 0} prefix={<UnlockOutlined />} />
          </Col>
          <Col span={8}>
            <Statistic
              title="Xu đã dùng"
              value={formatNumber(stats.unlock?.goldSpentOnUnlocks ?? 0)}
              prefix="🪙"
            />
          </Col>
          <Col span={8}>
            <Statistic title="Xem quảng cáo" value={stats.unlock?.adUnlocks ?? 0} />
          </Col>
        </Row>
      </Card>

      {/* Check-in & Social */}
      <Row gutter={16}>
        <Col span={12}>
          <Card size="small" title={<><CalendarOutlined /> Điểm danh</>}>
            <Statistic title="Tổng điểm danh" value={stats.checkIn?.totalCheckIns ?? 0} />
            <Divider style={{ margin: '8px 0' }} />
            <Statistic title="Xu nhận được" value={formatNumber(stats.checkIn?.totalCheckInGold ?? 0)} prefix="🪙" />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title={<><HeartOutlined /> Tương tác</>}>
            <Row gutter={8}>
              <Col span={12}>
                <Statistic title="Yêu thích" value={stats.social?.totalFavorites ?? 0} prefix={<HeartOutlined />} styles={{ content: { fontSize: 16 } }} />
              </Col>
              <Col span={12}>
                <Statistic title="Thích" value={stats.social?.totalLikes ?? 0} prefix={<LikeOutlined />} styles={{ content: { fontSize: 16 } }} />
              </Col>
              <Col span={12}>
                <Statistic title="Bình luận" value={stats.social?.totalComments ?? 0} prefix={<CommentOutlined />} styles={{ content: { fontSize: 16 } }} />
              </Col>
              <Col span={12}>
                <Statistic title="Đánh giá" value={stats.social?.totalRatings ?? 0} prefix={<StarOutlined />} styles={{ content: { fontSize: 16 } }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Financial & Achievements */}
      <Row gutter={16}>
        <Col span={12}>
          <Card size="small" title={<><DollarOutlined /> Tài chính</>}>
            <Statistic title="Giao dịch hoàn thành" value={stats.financial?.totalTransactions ?? 0} />
            <Divider style={{ margin: '8px 0' }} />
            <Statistic title="Tổng chi tiêu" value={formatNumber(stats.financial?.totalSpent ?? 0)} suffix="₫" />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title={<><TrophyOutlined /> Thành tích</>}>
            <Statistic title="Đã mở khóa" value={(stats as any).achievements ?? 0} prefix={<TrophyOutlined />} />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
