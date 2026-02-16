'use client';

import { memo } from 'react';
import { Table, Tag, Space, Button, Popconfirm, Avatar, Typography } from 'antd';
import { StarOutlined, StarFilled, DeleteOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import type { RatingItem } from '@/types';

const { Text } = Typography;

function StarDisplay({ rating }: { rating: number }) {
  return (
    <Space size={2}>
      {[1, 2, 3, 4, 5].map((s) => (
        s <= rating
          ? <StarFilled key={s} style={{ color: '#fadb14', fontSize: 14 }} />
          : <StarOutlined key={s} style={{ color: '#d9d9d9', fontSize: 14 }} />
      ))}
    </Space>
  );
}

interface RatingsTableProps {
  ratings: RatingItem[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onTableChange: (pagination: TablePaginationConfig, filters: unknown, sorter: unknown) => void;
  onDelete: (id: string) => void;
}

export default memo(function RatingsTable({
  ratings,
  loading,
  pagination,
  onTableChange,
  onDelete,
}: RatingsTableProps) {
  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 180,
      render: (_: any, record: RatingItem) => (
        <Space>
          <Avatar src={record.user?.avatar} size="small">{record.user?.nickname?.[0]}</Avatar>
          <div>
            <Text strong>{record.user?.nickname || '—'}</Text>
            {record.user?.vipTier === "VIP_GOLD" && (
              <Tag color="gold" className="ml-1" style={{ fontSize: 10 }}>VIP Gold</Tag>
            )}
            {record.user?.vipTier === "VIP_FREE_ADS" && (
              <Tag color="blue" className="ml-1" style={{ fontSize: 10 }}>VIP Free Ads</Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Video',
      key: 'video',
      width: 220,
      ellipsis: true,
      render: (_: any, record: RatingItem) => (
        <Text>{record.video?.title || '—'}</Text>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: RatingItem) => <StarDisplay rating={record.rating ?? record.score} />,
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: RatingItem) => (
        <Popconfirm
          title="Xác nhận xóa"
          description="Dữ liệu đánh giá của người dùng sẽ bị xóa vĩnh viễn"
          onConfirm={() => onDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          placement="topRight"
          okButtonProps={{ danger: true }}
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={ratings}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
      scroll={{ x: 1200 }}
    />
  );
});
