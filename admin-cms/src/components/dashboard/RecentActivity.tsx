'use client';

import React from 'react';
import { Card, List, Avatar, Tag, Typography } from 'antd';
import {
  UserAddOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  CrownOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { RecentActivityItem } from '@/types';
import { formatRelativeTime } from '@/lib/admin-utils';

const iconMap: Record<string, React.ReactNode> = {
  user_register: <UserAddOutlined style={{ color: '#1677ff' }} />,
  video_upload: <VideoCameraOutlined style={{ color: '#52c41a' }} />,
  payment: <DollarOutlined style={{ color: '#faad14' }} />,
  vip_purchase: <CrownOutlined style={{ color: '#722ed1' }} />,
  report: <WarningOutlined style={{ color: '#f5222d' }} />,
};

const tagMap: Record<string, { color: string; text: string }> = {
  user_register: { color: 'blue', text: 'Đăng ký' },
  video_upload: { color: 'green', text: 'Video' },
  payment: { color: 'gold', text: 'Thanh toán' },
  vip_purchase: { color: 'purple', text: 'VIP' },
  report: { color: 'red', text: 'Báo cáo' },
};

interface RecentActivityProps {
  activities: RecentActivityItem[];
  loading?: boolean;
}

export default function RecentActivity({ activities, loading }: RecentActivityProps) {
  return (
    <Card title="Hoạt động gần đây" loading={loading}>
      <List
        dataSource={activities}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={iconMap[item.type]} style={{ backgroundColor: '#f0f5ff' }} />}
              title={
                <span>
                  {item.title}{' '}
                  <Tag color={tagMap[item.type]?.color}>{tagMap[item.type]?.text}</Tag>
                </span>
              }
              description={
                <div>
                  <Typography.Text type="secondary">{item.description}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {formatRelativeTime(item.timestamp)}
                  </Typography.Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}
