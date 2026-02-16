'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Space, Typography, Progress, Empty, DatePicker } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, RocketOutlined, GiftOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { UserAchievementItem, UserDailyTaskItem } from '@/types';
import { formatDate, formatNumber } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface UserGamificationProps {
  userId: string;
}

const categoryLabels: Record<string, { color: string; label: string }> = {
  social: { color: 'blue', label: 'Xã hội' },
  watch: { color: 'green', label: 'Xem phim' },
  payment: { color: 'gold', label: 'Thanh toán' },
};

export default function UserGamification({ userId }: UserGamificationProps) {
  const [achievements, setAchievements] = useState<UserAchievementItem[]>([]);
  const [dailyTasks, setDailyTasks] = useState<UserDailyTaskItem[]>([]);
  const [loadingAch, setLoadingAch] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskDate, setTaskDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await adminAPI.getUserAchievements(userId);
        setAchievements(res.data || []);
      } catch {
        setAchievements([]);
      } finally {
        setLoadingAch(false);
      }
    };
    fetchAchievements();
  }, [userId]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const res = await adminAPI.getUserDailyTasks(userId, taskDate);
        setDailyTasks(res.data || []);
      } catch {
        setDailyTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [userId, taskDate]);

  const achColumns: ColumnsType<UserAchievementItem> = [
    {
      title: 'Thành tích',
      key: 'name',
      render: (_, record) => (
        <Space>
          <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
          <div>
            <Typography.Text strong>{record.achievement.name}</Typography.Text>
            {record.achievement.description && (
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {record.achievement.description}
                </Typography.Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Danh mục',
      key: 'category',
      width: 100,
      render: (_, record) => {
        const cat = record.achievement.category || 'other';
        const config = categoryLabels[cat] || { color: 'default', label: cat };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Phần thưởng',
      key: 'reward',
      width: 110,
      render: (_, record) =>
        (record.achievement?.rewardGold ?? 0) > 0 ? (
          <Typography.Text style={{ color: '#faad14' }}>
            +{formatNumber(record.achievement?.rewardGold ?? 0)} 🪙
          </Typography.Text>
        ) : (
          '-'
        ),
    },
    {
      title: 'Đã nhận',
      dataIndex: 'rewardClaimed',
      key: 'rewardClaimed',
      width: 90,
      render: (v: boolean) =>
        v ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Rồi</Tag>
        ) : (
          <Tag color="default">Chưa</Tag>
        ),
    },
    {
      title: 'Ngày mở khóa',
      dataIndex: 'unlockedAt',
      key: 'unlockedAt',
      width: 140,
      render: (d: string) => formatDate(d),
    },
  ];

  const taskColumns: ColumnsType<UserDailyTaskItem> = [
    {
      title: 'Nhiệm vụ',
      key: 'name',
      render: (_, record) => (
        <Space>
          <RocketOutlined style={{ color: '#1890ff' }} />
          <div>
            <Typography.Text strong>{record.task.name}</Typography.Text>
            {record.task.description && (
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {record.task.description}
                </Typography.Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 180,
      render: (_, record) => (
        <Space orientation="vertical" size={2} style={{ width: '100%' }}>
          <Progress
            percent={Math.round(((record.currentCount ?? 0) / (record.task?.targetCount ?? 1)) * 100)}
            size="small"
            status={record.isCompleted ? 'success' : 'active'}
          />
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {record.currentCount ?? 0}/{record.task?.targetCount ?? 0}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Phần thưởng',
      key: 'reward',
      width: 100,
      render: (_, record) => (
        <Typography.Text style={{ color: '#faad14' }}>
          +{formatNumber(record.task?.rewardGold ?? 0)} 🪙
        </Typography.Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_, record) =>
        record.isCompleted ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Hoàn thành</Tag>
        ) : (
          <Tag color="processing">Đang làm</Tag>
        ),
    },
    {
      title: 'Đã nhận',
      dataIndex: 'rewardClaimed',
      key: 'rewardClaimed',
      width: 80,
      render: (v: boolean) =>
        v ? <Tag icon={<GiftOutlined />} color="green">Rồi</Tag> : <Tag color="default">Chưa</Tag>,
    },
  ];

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Card
        title={<><RocketOutlined /> Nhiệm vụ hàng ngày</>}
        size="small"
        extra={
          <DatePicker
            defaultValue={dayjs()}
            onChange={(date) => setTaskDate(date?.toISOString())}
            allowClear={false}
          />
        }
      >
        {dailyTasks.length > 0 ? (
          <Table
            dataSource={dailyTasks}
            columns={taskColumns}
            rowKey="id"
            loading={loadingTasks}
            size="small"
            pagination={false}
          />
        ) : (
          <Empty description={loadingTasks ? 'Đang tải...' : 'Không có nhiệm vụ cho ngày này'} />
        )}
      </Card>

      <Card title={<><TrophyOutlined /> Thành tích đã mở khóa ({achievements.length})</>} size="small">
        {achievements.length > 0 ? (
          <Table
            dataSource={achievements}
            columns={achColumns}
            rowKey="id"
            loading={loadingAch}
            size="small"
            pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} thành tích` }}
          />
        ) : (
          <Empty description={loadingAch ? 'Đang tải...' : 'Chưa có thành tích nào'} />
        )}
      </Card>
    </Space>
  );
}
