'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tabs, message } from 'antd';
import {
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FireOutlined,
  GoldOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { GamificationOverview } from '@/types/admin';
import DailyTasksTab from '@/components/gamification/DailyTasksTab';
import AchievementsTab from '@/components/gamification/AchievementsTab';
import CheckInRewardsTab from '@/components/gamification/CheckInRewardsTab';

export default function GamificationPage() {
  const [overview, setOverview] = useState<GamificationOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('daily-tasks');

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getGamificationOverview();
      setOverview(res.data);
    } catch {
      message.error('Không thể tải dữ liệu gamification');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 600 }}>
        🎮 Quản lý Gamification
      </h2>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small">
            <Statistic
              title="Nhiệm vụ đang hoạt động"
              value={overview?.dailyTasks.activeTasks || 0}
              suffix={`/ ${overview?.dailyTasks.totalTasks || 0}`}
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small">
            <Statistic
              title="Hoàn thành hôm nay"
              value={overview?.dailyTasks.todayCompletions || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small">
            <Statistic
              title="Thành tích đã mở"
              value={overview?.achievements.totalUnlocked || 0}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small">
            <Statistic
              title="Điểm danh hôm nay"
              value={overview?.checkIns.todayCheckIns || 0}
              suffix={`(tuần: ${overview?.checkIns.weekCheckIns || 0})`}
              prefix={<CalendarOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'daily-tasks',
              label: (
                <span>
                  <FireOutlined /> Nhiệm vụ hằng ngày
                </span>
              ),
              children: <DailyTasksTab />,
            },
            {
              key: 'achievements',
              label: (
                <span>
                  <TrophyOutlined /> Thành tích
                </span>
              ),
              children: <AchievementsTab />,
            },
            {
              key: 'check-in',
              label: (
                <span>
                  <GoldOutlined /> Điểm danh & Phần thưởng
                </span>
              ),
              children: <CheckInRewardsTab />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
