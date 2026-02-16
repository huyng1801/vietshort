'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Space, Typography, Empty, Button, Tooltip } from 'antd';
import { HeartOutlined, LikeOutlined, StarOutlined, BookOutlined, ShareAltOutlined, ReloadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { formatDate } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

interface SocialItem {
  id: string;
  videoId: string;
  video: { id: string; title: string; poster?: string; slug: string };
  createdAt: string;
  score?: number;
  rating?: number;
}

interface UserSocialActivityProps {
  userId: string;
}

export default function UserSocialActivity({ userId }: UserSocialActivityProps) {
  const [favorites, setFavorites] = useState<SocialItem[]>([]);
  const [likes, setLikes] = useState<SocialItem[]>([]);
  const [ratings, setRatings] = useState<SocialItem[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setLoadingFav(true);
    try {
      const res = await adminAPI.getComments({ userId, page: 1, limit: 100 });
      // Use favorites endpoint if available, fallback to empty
      setFavorites([]);
    } catch {
      setFavorites([]);
    } finally {
      setLoadingFav(false);
    }
  }, [userId]);

  // We'll show a summary of social activities from the engagement stats
  const [stats, setStats] = useState<any>(null);
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

  const socialData = [
    {
      key: 'favorites',
      label: 'Sưu tầm (Bookmark)',
      icon: <BookOutlined style={{ color: '#faad14' }} />,
      count: stats?.social?.totalFavorites ?? 0,
      color: '#faad14',
    },
    {
      key: 'likes',
      label: 'Yêu thích (Tim)',
      icon: <HeartOutlined style={{ color: '#eb2f96' }} />,
      count: stats?.social?.totalLikes ?? 0,
      color: '#eb2f96',
    },
    {
      key: 'comments',
      label: 'Bình luận',
      icon: <LikeOutlined style={{ color: '#1890ff' }} />,
      count: stats?.social?.totalComments ?? 0,
      color: '#1890ff',
    },
    {
      key: 'ratings',
      label: 'Đánh giá',
      icon: <StarOutlined style={{ color: '#fadb14' }} />,
      count: stats?.social?.totalRatings ?? 0,
      color: '#fadb14',
    },
    {
      key: 'shares',
      label: 'Chia sẻ',
      icon: <ShareAltOutlined style={{ color: '#52c41a' }} />,
      count: stats?.social?.shares ?? 0,
      color: '#52c41a',
    },
  ];

  const columns: ColumnsType<typeof socialData[0]> = [
    {
      title: 'Loại tương tác',
      key: 'label',
      render: (_, record) => (
        <Space>
          {record.icon}
          <Typography.Text strong>{record.label}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      width: 150,
      align: 'center',
      render: (v: number, record) => (
        <Tag color={record.color} style={{ fontSize: 14, padding: '4px 12px' }}>
          {v.toLocaleString()}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title={<><HeartOutlined /> Tương tác xã hội</>}
      size="small"
      loading={loading}
    >
      {!stats ? (
        <Empty description="Không có dữ liệu tương tác" />
      ) : (
        <Table
          dataSource={socialData}
          columns={columns}
          rowKey="key"
          pagination={false}
          size="small"
        />
      )}
    </Card>
  );
}
