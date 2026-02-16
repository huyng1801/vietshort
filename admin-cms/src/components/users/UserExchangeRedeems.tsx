'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Empty } from 'antd';
import { GiftOutlined, ReloadOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { formatDate, formatNumber } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

interface ExchangeRedeemItem {
  id: string;
  code: string;
  rewardType: string;
  rewardValue: number;
  redeemedAt: string;
  createdAt: string;
  exchangeCode?: {
    code: string;
    batch?: { name: string; description?: string };
  };
}

interface UserExchangeRedeemsProps {
  userId: string;
}

const REWARD_TYPE_MAP: Record<string, { color: string; label: string }> = {
  GOLD: { color: 'gold', label: 'Xu' },
  VIP_DAYS: { color: 'purple', label: 'Ngày VIP' },
  VIP_GOLD: { color: 'volcano', label: 'VIP Gold' },
  VIP_FREEADS: { color: 'blue', label: 'VIP FreeAds' },
};

export default function UserExchangeRedeems({ userId }: UserExchangeRedeemsProps) {
  const [data, setData] = useState<ExchangeRedeemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchData = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserTransactions(userId, { page, limit, type: 'EXCHANGE_REDEEM' });
      const result = res.data?.data || res.data;
      const items = result?.items || result?.data || [];
      setData(items);
      const p = result?.pagination;
      if (p) setPagination({ current: p.page, pageSize: p.limit, total: p.total });
      else setPagination((prev) => ({ ...prev, total: result?.total || items.length }));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnsType<ExchangeRedeemItem> = [
    {
      title: 'Mã đổi',
      key: 'code',
      width: 200,
      render: (_, record) => (
        <Typography.Text code copyable>
          {record.exchangeCode?.code || record.code || '-'}
        </Typography.Text>
      ),
    },
    {
      title: 'Lô mã',
      key: 'batch',
      width: 200,
      render: (_, record) => (
        <div>
          <Typography.Text>{record.exchangeCode?.batch?.name || '-'}</Typography.Text>
          {record.exchangeCode?.batch?.description && (
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {record.exchangeCode.batch.description}
              </Typography.Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Loại phần thưởng',
      dataIndex: 'rewardType',
      key: 'rewardType',
      width: 130,
      render: (type: string) => {
        const config = REWARD_TYPE_MAP[type] || { color: 'default', label: type };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Giá trị',
      dataIndex: 'rewardValue',
      key: 'rewardValue',
      width: 120,
      render: (v: number, record) => {
        if (record.rewardType === 'GOLD') {
          return (
            <Typography.Text style={{ color: '#faad14' }}>
              +{formatNumber(v)} 🪙
            </Typography.Text>
          );
        }
        if (record.rewardType === 'VIP_DAYS') {
          return <Tag color="purple">{v} ngày VIP</Tag>;
        }
        return <Typography.Text>{v}</Typography.Text>;
      },
    },
    {
      title: 'Thời gian đổi',
      key: 'createdAt',
      width: 160,
      render: (_, record) => formatDate(record.redeemedAt || record.createdAt),
    },
  ];

  return (
    <Card
      title={<><GiftOutlined /> Lịch sử nhập mã đổi thưởng</>}
      size="small"
      extra={<Button icon={<ReloadOutlined />} size="small" onClick={() => fetchData()} />}
    >
      {data.length === 0 && !loading ? (
        <Empty description="Chưa đổi mã nào" />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} mã đã đổi`,
          }}
          onChange={(p) => fetchData(p.current, p.pageSize)}
        />
      )}
    </Card>
  );
}
