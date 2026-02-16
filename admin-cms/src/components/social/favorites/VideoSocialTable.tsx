'use client';

import { memo } from 'react';
import { Table, Tag, Space, Typography } from 'antd';
import { BookFilled, HeartFilled, PlayCircleOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import type { VideoSocialStats } from '@/types';

const { Text } = Typography;

interface VideoSocialTableProps {
  videos: VideoSocialStats[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onTableChange: (pagination: TablePaginationConfig, filters: unknown, sorter: unknown) => void;
  type: 'favorites' | 'likes';
}

export default memo(function VideoSocialTable({
  videos,
  loading,
  pagination,
  onTableChange,
  type,
}: VideoSocialTableProps) {
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
          <Text strong className="line-clamp-1">{record.title}</Text>
        </Space>
      ),
    },
    {
      title: type === 'favorites' ? 'Sưu tầm' : 'Yêu thích',
      dataIndex: type === 'favorites' ? 'favoriteCount' : 'likeCount',
      key: type === 'favorites' ? 'favoriteCount' : 'likeCount',
      width: 130,
      align: 'center' as const,
      sorter: (a: VideoSocialStats, b: VideoSocialStats) => 
        type === 'favorites' ? a.favoriteCount - b.favoriteCount : a.likeCount - b.likeCount,
      render: (v: number) => (
        type === 'favorites' 
          ? <Tag color="gold" icon={<BookFilled />}>{v.toLocaleString()}</Tag>
          : <Tag color="magenta" icon={<HeartFilled />}>{v.toLocaleString()}</Tag>
      ),
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
      scroll={{ x: 1000 }}
    />
  );
});
