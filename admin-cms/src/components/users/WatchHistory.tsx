'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Space, Image, Typography, DatePicker, Select, Button } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { WatchHistoryItem } from '@/types';
import { formatDate, formatDuration } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface WatchHistoryProps {
  userId: string;
}

export default function WatchHistory({ userId }: WatchHistoryProps) {
  const [data, setData] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const fetchData = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserWatchHistory(userId, { page, limit, ...filters });
      setData(res.data?.items || []);
      const p = res.data?.pagination;
      if (p) setPagination({ current: p.page, pageSize: p.limit, total: p.total });
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnsType<WatchHistoryItem> = [
    {
      title: 'Phim',
      key: 'video',
      width: 280,
      render: (_, record) => (
        <Space>
          {record.video?.poster && (
            <Image src={record.video?.poster} width={40} height={56} alt="" style={{ borderRadius: 4, objectFit: 'cover' }} preview={false} />
          )}
          <div>
            <Typography.Text strong ellipsis style={{ maxWidth: 200, display: 'block' }}>
              {record.video?.title}
            </Typography.Text>
            {record.episode && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Tập {record.episode.episodeNumber}: {record.episode.title}
              </Typography.Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Thời gian xem',
      dataIndex: 'watchTime',
      key: 'watchTime',
      width: 120,
      render: (v: number) => (
        <Space>
          <ClockCircleOutlined />
          {formatDuration(v)}
        </Space>
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progressive',
      key: 'progressive',
      width: 120,
      render: (v: number) => formatDuration(v),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isCompleted',
      key: 'isCompleted',
      width: 120,
      render: (v: boolean) =>
        v ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Hoàn thành</Tag>
        ) : (
          <Tag icon={<PlayCircleOutlined />} color="processing">Đang xem</Tag>
        ),
    },
    {
      title: 'Lần xem cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (d: string) => formatDate(d),
    },
  ];

  return (
    <Card
      title={<><PlayCircleOutlined /> Lịch sử xem phim</>}
      size="small"
      extra={
        <Space>
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 130 }}
            options={[
              { label: 'Hoàn thành', value: 'true' },
              { label: 'Đang xem', value: 'false' },
            ]}
            onChange={(v) => setFilters((prev) => ({ ...prev, isCompleted: v }))}
          />
          <RangePicker
            onChange={(dates) => {
              setFilters((prev) => ({
                ...prev,
                dateFrom: dates?.[0]?.toISOString(),
                dateTo: dates?.[1]?.toISOString(),
              }));
            }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData()} />
        </Space>
      }
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (t) => `Tổng ${t} mục`,
          pageSizeOptions: ['10', '20', '50'],
        }}
        onChange={(p) => fetchData(p.current, p.pageSize)}
      />
    </Card>
  );
}
