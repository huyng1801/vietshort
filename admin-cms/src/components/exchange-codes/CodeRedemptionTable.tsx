'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Typography, Tag, message } from 'antd';
import { CodeRedemption } from '@/types';
import { formatDate } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

interface CodeRedemptionTableProps {
  batchId?: string;
  data?: CodeRedemption[];
  loading?: boolean;
}

export default function CodeRedemptionTable({ batchId, data: externalData, loading: externalLoading }: CodeRedemptionTableProps) {
  const [internalData, setInternalData] = useState<CodeRedemption[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const data = externalData ?? internalData;
  const loading = externalLoading ?? internalLoading;

  const fetchRedemptions = useCallback(async () => {
    if (externalData || !batchId) return;
    setInternalLoading(true);
    try {
      const res = await adminAPI.getCodeRedemptions(batchId);
      setInternalData(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      message.error('Không thể tải lịch sử đổi mã');
    } finally {
      setInternalLoading(false);
    }
  }, [batchId, externalData]);

  useEffect(() => {
    if (batchId) fetchRedemptions();
  }, [batchId, fetchRedemptions]);

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (c: string) => <Typography.Text code>{c}</Typography.Text>,
    },
    {
      title: 'Người dùng',
      dataIndex: 'userNickname',
      key: 'user',
      width: 150,
      render: (name: string) => name || 'Ẩn danh',
    },
    {
      title: 'Phần thưởng',
      dataIndex: 'rewardType',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'GOLD' ? 'gold' : 'purple'}>
          {type === 'GOLD' ? '🪙 Xu vàng' : '👑 VIP Days'}
        </Tag>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'rewardValue',
      key: 'value',
      width: 100,
      render: (v: number, record: CodeRedemption) =>
        record.rewardType === 'GOLD' ? `${v?.toLocaleString()} xu` : `${v} ngày`,
    },
    {
      title: 'Thời gian',
      dataIndex: 'redeemedAt',
      key: 'date',
      width: 160,
      render: (d: string) => formatDate(d),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="id"
      scroll={{ x: 700 }}
      locale={{ emptyText: 'Chưa có lịch sử đổi mã' }}
    />
  );
}
