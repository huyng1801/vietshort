'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import {
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FireOutlined,
  GoldOutlined,
  ThunderboltOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import type { GamificationOverview } from '@/types';

export default function GamificationPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<GamificationOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getGamificationOverview();
      setOverview(res.data);
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🎮 Quản lý Gamification</h1>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Nhiệm vụ đang hoạt động"
              value={overview?.dailyTasks.activeTasks || 0}
              suffix={`/ ${overview?.dailyTasks.totalTasks || 0}`}
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Hoàn thành hôm nay"
              value={overview?.dailyTasks.todayCompletions || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Thành tích đã mở"
              value={overview?.achievements.totalUnlocked || 0}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Điểm danh hôm nay"
              value={overview?.checkIns?.todayCheckIns || 0}
              suffix={`(tuần: ${overview?.checkIns?.weekCheckIns || 0})`}
              prefix={<CalendarOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Access Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => router.push('/gamification/daily-tasks')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  <FireOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  Nhiệm vụ hằng ngày
                </div>
                <div style={{ color: '#888', fontSize: 14 }}>
                  Quản lý nhiệm vụ và phần thưởng
                </div>
              </div>
              <RightOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => router.push('/gamification/achievements')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  Thành tích
                </div>
                <div style={{ color: '#888', fontSize: 14 }}>
                  Quản lý huy hiệu và phần thưởng
                </div>
              </div>
              <RightOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => router.push('/gamification/check-in-rewards')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  <GoldOutlined style={{ color: '#eb2f96', marginRight: 8 }} />
                  Điểm danh - Phần thưởng
                </div>
                <div style={{ color: '#888', fontSize: 14 }}>
                  Cấu hình phần thưởng 7 ngày
                </div>
              </div>
              <RightOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
