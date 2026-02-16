'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Select, DatePicker, Empty, Statistic, Row, Col, Divider } from 'antd';
import { DollarOutlined, ReloadOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { WalletTransaction } from '@/types';
import { formatDate, formatNumber, formatCurrency } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface UserTransactionsProps {
  userId: string;
}

const TYPE_MAP: Record<string, { color: string; label: string }> = {
  PURCHASE_GOLD: { color: 'green', label: 'Nạp xu' },
  PURCHASE_VIP: { color: 'purple', label: 'Mua VIP' },
  SPEND_GOLD: { color: 'red', label: 'Chi xu' },
  REFUND: { color: 'orange', label: 'Hoàn tiền' },
  ADMIN_ADJUST: { color: 'blue', label: 'Admin điều chỉnh' },
  EXCHANGE_REDEEM: { color: 'magenta', label: 'Đổi mã' },
  AD_REWARD: { color: 'cyan', label: 'Xem quảng cáo' },
  CHECKIN_REWARD: { color: 'geekblue', label: 'Điểm danh' },
  TASK_REWARD: { color: 'lime', label: 'Nhiệm vụ' },
  ACHIEVEMENT_REWARD: { color: 'gold', label: 'Thành tích' },
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  COMPLETED: { color: 'success', label: 'Thành công' },
  PENDING: { color: 'processing', label: 'Chờ xử lý' },
  FAILED: { color: 'error', label: 'Thất bại' },
  REFUNDED: { color: 'warning', label: 'Đã hoàn' },
};

export default function UserTransactions({ userId }: UserTransactionsProps) {
  const [data, setData] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, count: 0 });

  const fetchData = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserTransactions(userId, { page, limit, ...filters });
      const result = res.data?.data || res.data;
      const items = result?.items || result?.data || [];
      setData(items);
      const p = result?.pagination;
      if (p) setPagination({ current: p.page, pageSize: p.limit, total: p.total });
      else setPagination((prev) => ({ ...prev, total: result?.total || 0 }));

      // Calculate summary from current page data
      const totalIn = items.filter((t: WalletTransaction) => (t.goldAmount ?? t.amount) > 0)
        .reduce((sum: number, t: WalletTransaction) => sum + Math.abs(t.goldAmount ?? t.amount), 0);
      const totalOut = items.filter((t: WalletTransaction) => (t.goldAmount ?? t.amount) < 0)
        .reduce((sum: number, t: WalletTransaction) => sum + Math.abs(t.goldAmount ?? t.amount), 0);
      setSummary({ totalIn, totalOut, count: p?.total || result?.total || items.length });
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnsType<WalletTransaction> = [
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const config = TYPE_MAP[type] || { color: 'default', label: type };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Số lượng',
      key: 'amount',
      width: 130,
      render: (_, record) => {
        const amount = record.goldAmount ?? record.amount;
        return (
          <Typography.Text strong style={{ color: amount > 0 ? '#52c41a' : '#f5222d' }}>
            {amount > 0 ? '+' : ''}{formatNumber(amount)} 🪙
          </Typography.Text>
        );
      },
    },
    {
      title: 'Số dư sau',
      key: 'balanceAfter',
      width: 120,
      render: (_, record) =>
        record.balanceAfter != null ? (
          <Typography.Text>{formatNumber(record.balanceAfter)} 🪙</Typography.Text>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = STATUS_MAP[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (d: string) => formatDate(d),
    },
  ];

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      {/* Summary stats */}
      <Row gutter={16}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Tổng giao dịch"
              value={summary.count}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Tổng nhận"
              value={formatNumber(summary.totalIn)}
              prefix={<RiseOutlined />}
              suffix="🪙"
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Tổng chi"
              value={formatNumber(summary.totalOut)}
              prefix={<FallOutlined />}
              suffix="🪙"
              styles={{ content: { color: '#f5222d' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters & Table */}
      <Card
        title={<><DollarOutlined /> Lịch sử giao dịch</>}
        size="small"
        extra={
          <Space>
            <Select
              placeholder="Loại giao dịch"
              allowClear
              style={{ width: 160 }}
              options={Object.entries(TYPE_MAP).map(([value, conf]) => ({
                label: conf.label,
                value,
              }))}
              onChange={(v) => setFilters((prev) => ({ ...prev, type: v }))}
            />
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: 130 }}
              options={Object.entries(STATUS_MAP).map(([value, conf]) => ({
                label: conf.label,
                value,
              }))}
              onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
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
            showTotal: (t) => `Tổng ${t} giao dịch`,
          }}
          onChange={(p) => fetchData(p.current, p.pageSize)}
        />
      </Card>
    </Space>
  );
}
