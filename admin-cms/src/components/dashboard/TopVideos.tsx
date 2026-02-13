'use client';

import React from 'react';
import { Card, Table, Avatar, Typography, Tag } from 'antd';
import { EyeOutlined, HeartOutlined, DollarOutlined } from '@ant-design/icons';
import { TopVideo } from '@/types/dashboard';
import { formatNumber, formatCurrency } from '@/lib/admin-utils';

interface TopVideosProps {
  videos: TopVideo[];
  loading?: boolean;
}

export default function TopVideos({ videos, loading }: TopVideosProps) {
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => (
        <Tag color={index < 3 ? 'gold' : 'default'}>{index + 1}</Tag>
      ),
    },
    {
      title: 'Video',
      key: 'video',
      render: (_: unknown, record: TopVideo) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar
            shape="square"
            size={48}
            src={record.thumbnailUrl}
            style={{ flexShrink: 0 }}
          />
          <Typography.Text ellipsis style={{ maxWidth: 200 }}>
            {record.title}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      render: (v: number) => (
        <span>
          <EyeOutlined /> {formatNumber(v)}
        </span>
      ),
    },
    {
      title: 'Lượt thích',
      dataIndex: 'likeCount',
      key: 'likeCount',
      render: (v: number) => (
        <span>
          <HeartOutlined /> {formatNumber(v)}
        </span>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (v: number) => (
        <span>
          <DollarOutlined /> {formatCurrency(v)}
        </span>
      ),
    },
  ];

  return (
    <Card title="Top Video nổi bật" loading={loading}>
      <Table
        dataSource={videos}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="id"
      />
    </Card>
  );
}
