'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Table, Tag, Space, Typography } from 'antd';
import { BookFilled, HeartFilled, PlayCircleOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import type { VideoSocialStats } from '@/types';

const { Text } = Typography;

interface VideoInteractionsTableProps {
  videos: VideoSocialStats[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onTableChange: (pagination: TablePaginationConfig, filters: unknown, sorter: unknown) => void;
}

export default memo(function VideoInteractionsTable({
  videos,
  loading,
  pagination,
  onTableChange,
}: VideoInteractionsTableProps) {
  const columns = [
    {
      title: 'Video',
      key: 'title',
      width: 280,
      render: (_: any, record: VideoSocialStats) => (
        <Space>
          {record.poster ? (
            <img src={record.poster} alt="" className="w-12 h-8 object-cover rounded" />
          ) : (
            <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
              <PlayCircleOutlined />
            </div>
          )}
          <Link href={`/videos/${record.id}`}>
            <Text strong className="line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
              {record.title}
            </Text>
          </Link>
        </Space>
      ),
    },
    {
      title: 'Sưu tầm',
      dataIndex: 'favoriteCount',
      key: 'favoriteCount',
      width: 110,
      align: 'center' as const,
      sorter: (a: VideoSocialStats, b: VideoSocialStats) => a.favoriteCount - b.favoriteCount,
      render: (v: number) => <Tag color="gold" icon={<BookFilled />}>{v.toLocaleString()}</Tag>,
    },
    {
      title: 'Yêu thích',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 110,
      align: 'center' as const,
      sorter: (a: VideoSocialStats, b: VideoSocialStats) => a.likeCount - b.likeCount,
      render: (v: number) => <Tag color="magenta" icon={<HeartFilled />}>{v.toLocaleString()}</Tag>,
    },
    {
      title: 'Tổng tương tác',
      dataIndex: 'totalInteractions',
      key: 'totalInteractions',
      width: 130,
      align: 'center' as const,
      sorter: (a: VideoSocialStats, b: VideoSocialStats) => (a.totalInteractions || 0) - (b.totalInteractions || 0),
      render: (v: number) => <Tag color="purple">{v.toLocaleString()}</Tag>,
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 110,
      align: 'center' as const,
      render: (v: number) => <Tag color="cyan">{v.toLocaleString()}</Tag>,
    },
    {
      title: 'Bình luận',
      dataIndex: 'commentCount',
      key: 'commentCount',
      width: 100,
      align: 'center' as const,
      render: (v: number) => <Tag>{v.toLocaleString()}</Tag>,
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: VideoSocialStats) => (
        record.ratingAverage
          ? <Text>⭐ {record.ratingAverage.toFixed(1)} ({record.ratingCount})</Text>
          : <Text type="secondary">—</Text>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={videos}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
      scroll={{ x: 1100 }}
    />
  );
});
