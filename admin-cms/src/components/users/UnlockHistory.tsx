'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Space, Image, Typography, DatePicker, Select, Button } from 'antd';
import { UnlockOutlined, ReloadOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { UnlockHistoryItem } from '@/types';
import { formatDate, formatNumber } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface UnlockHistoryProps {
  userId: string;
}

export default function UnlockHistory({ userId }: UnlockHistoryProps) {
  const [data, setData] = useState<UnlockHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const fetchData = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserUnlockHistory(userId, { page, limit, ...filters });
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

  const methodMap: Record<string, { color: string; label: string }> = {
    GOLD: { color: 'gold', label: 'Xu' },
    AD: { color: 'blue', label: 'Xem QC' },
    VIP: { color: 'purple', label: 'VIP' },
    FREE: { color: 'green', label: 'Miễn phí' },
  };

  const columns: ColumnsType<UnlockHistoryItem> = [
    {
      title: 'Phim / Tập',
      key: 'episode',
      width: 320,
      render: (_, record) => (
        <Space>
          {record.episode?.video?.poster && (
            <Image src={record.episode.video.poster} width={40} height={56} alt="" style={{ borderRadius: 4, objectFit: 'cover' }} preview={false} />
          )}
          <div>
            <Typography.Text strong ellipsis style={{ maxWidth: 220, display: 'block' }}>
              {record.episode?.video?.title || '-'}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Tập {record.episode?.episodeNumber}: {record.episode?.title}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (method: string) => {
        const config = methodMap[method] || { color: 'default', label: method };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Chi phí',
      key: 'cost',
      width: 120,
      render: (_, record) => {
        if (record.method === 'GOLD' && record.goldSpent) {
          return (
            <Typography.Text style={{ color: '#faad14' }}>
              -{formatNumber(record.goldSpent)} 🪙
            </Typography.Text>
          );
        }
        if (record.method === 'AD') {
          return <Tag color="blue">Xem quảng cáo</Tag>;
        }
        return <Typography.Text type="secondary">Miễn phí</Typography.Text>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (d: string) => formatDate(d),
    },
  ];

  return (
    <Card
      title={<><UnlockOutlined /> Lịch sử giải khóa</>}
      size="small"
      extra={
        <Space>
          <Select
            placeholder="Phương thức"
            allowClear
            style={{ width: 130 }}
            options={[
              { label: 'Xu', value: 'GOLD' },
              { label: 'Xem QC', value: 'AD' },
              { label: 'VIP', value: 'VIP' },
              { label: 'Miễn phí', value: 'FREE' },
            ]}
            onChange={(v) => setFilters((prev) => ({ ...prev, method: v }))}
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
