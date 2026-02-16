'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Space, Button, Select, message, Popconfirm, Avatar, Typography, Row, Col, Statistic, Tooltip, Progress } from 'antd';
import {
  StarOutlined,
  StarFilled,
  DeleteOutlined,
  ReloadOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { RatingItem, RatingStats } from '@/types';

const { Text } = Typography;

const STAR_COLORS: Record<number, string> = {
  1: '#ff4d4f',
  2: '#fa8c16',
  3: '#fadb14',
  4: '#52c41a',
  5: '#1890ff',
};

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

export default function RatingsPage() {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);

  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getRatings({
        page: params.page,
        limit: params.limit,
        rating: filterRating,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const result = res.data?.data || res.data;
      setRatings(Array.isArray(result) ? result : result?.data || []);
      setTotal(res.data?.pagination?.total || res.data?.total || 0);
    } catch {
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, filterRating, setTotal]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getRatingStats();
      setStats(res.data?.data || res.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteRating(id);
      message.success('Đã xóa đánh giá');
      fetchRatings();
      fetchStats();
    } catch {
      message.error('Xóa thất bại');
    }
  };

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
            {record.user?.vipTier && (
              <Tag color="gold" className="ml-1" style={{ fontSize: 10 }}>VIP</Tag>
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
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: RatingItem) => (
        <Popconfirm title="Xóa đánh giá này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        <StarOutlined className="mr-2" />
        Quản lý đánh giá
      </h2>

      {/* Stats */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card size="small">
            <Statistic title="Tổng đánh giá" value={stats?.total || 0} prefix={<StarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Trung bình"
              value={stats?.averageRating || 0}
              precision={1}
              suffix="/ 5"
              prefix={<StarFilled style={{ color: '#fadb14' }} />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="Phân bố đánh giá">
            <div className="space-y-1">
              {stats?.distribution?.map((d) => {
                const percent = stats.totalRatings > 0 ? Math.round((d.count / stats.totalRatings) * 100) : 0;
                return (
                  <div key={d.star} className="flex items-center gap-2">
                    <Text className="w-8">{d.star} ⭐</Text>
                    <Progress
                      percent={percent}
                      size="small"
                      className="flex-1 mb-0"
                      strokeColor={STAR_COLORS[d.star ?? d.score]}
                      format={() => `${d.count}`}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top rated videos */}
      {stats?.topRatedVideos && stats.topRatedVideos.length > 0 && (
        <Card size="small" title={<><TrophyOutlined className="mr-1" /> Top 10 video được đánh giá cao nhất</>} className="mb-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {stats.topRatedVideos.map((v, i) => (
              <div key={v.id} className="flex-shrink-0 text-center" style={{ width: 100 }}>
                <Tag color={i < 3 ? 'gold' : 'default'}>#{i + 1}</Tag>
                <Tooltip title={v.title}>
                  <Text ellipsis className="block text-xs mt-1">{v.title}</Text>
                </Tooltip>
                <Text type="secondary" className="text-xs">
                  ⭐ {v.ratingAverage?.toFixed(1)} ({v.ratingCount})
                </Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card size="small" className="mb-4">
        <Space>
          <Select
            placeholder="Lọc theo sao"
            value={filterRating}
            onChange={(v) => { setFilterRating(v); setParams((p) => ({ ...p, page: 1 })); }}
            style={{ width: 160 }}
            allowClear
          >
            {[5, 4, 3, 2, 1].map((s) => (
              <Select.Option key={s} value={s}>{s} sao</Select.Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => { fetchRatings(); fetchStats(); }}>
            Làm mới
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={ratings}
        rowKey="id"
        loading={loading}
        pagination={paginationConfig}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
        size="middle"
      />
    </div>
  );
}
