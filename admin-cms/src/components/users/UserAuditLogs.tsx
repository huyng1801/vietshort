'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Space, Typography, DatePicker, Select, Button, Tooltip } from 'antd';
import { AuditOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { AuditLogItem } from '@/types';
import { formatDate } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface UserAuditLogsProps {
  userId: string;
}

const actionLabels: Record<string, { color: string; label: string }> = {
  LOCK_USER: { color: 'red', label: 'Khóa tài khoản' },
  UNLOCK_USER: { color: 'green', label: 'Mở khóa' },
  ADJUST_GOLD: { color: 'gold', label: 'Điều chỉnh xu' },
  ADJUST_VIP: { color: 'purple', label: 'Điều chỉnh VIP' },
  UPDATE_USER: { color: 'blue', label: 'Cập nhật hồ sơ' },
  BAN_USER: { color: 'volcano', label: 'Cấm tài khoản' },
  UNBAN_USER: { color: 'lime', label: 'Gỡ cấm' },
  DELETE_COMMENT: { color: 'orange', label: 'Xóa bình luận' },
  MODERATE_COMMENT: { color: 'cyan', label: 'Kiểm duyệt BL' },
};

export default function UserAuditLogs({ userId }: UserAuditLogsProps) {
  const [data, setData] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const fetchData = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserAuditLogs(userId, { page, limit, ...filters });
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

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 160,
      render: (action: string) => {
        const config = actionLabels[action] || { color: 'default', label: action };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Tài nguyên',
      key: 'resource',
      width: 150,
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text>{record.resource}</Typography.Text>
          {record.resourceId && (
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {record.resourceId.substring(0, 12)}...
            </Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Thay đổi',
      dataIndex: 'changes',
      key: 'changes',
      width: 250,
      render: (changes: Record<string, unknown> | null) => {
        if (!changes) return <Typography.Text type="secondary">-</Typography.Text>;
        return (
          <Tooltip
            title={<pre style={{ margin: 0, fontSize: 11 }}>{JSON.stringify(changes, null, 2)}</pre>}
            overlayStyle={{ maxWidth: 400 }}
          >
            <Space>
              <InfoCircleOutlined />
              <Typography.Text ellipsis style={{ maxWidth: 200 }}>
                {Object.entries(changes).map(([k, v]) => `${k}: ${v}`).join(', ')}
              </Typography.Text>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: 'Admin',
      key: 'admin',
      width: 150,
      render: (_, record) =>
        record.admin ? (
          <Space orientation="vertical" size={0}>
            <Typography.Text>{[record.admin.firstName, record.admin.lastName].filter(Boolean).join(' ') || 'Admin'}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {record.admin.email}
            </Typography.Text>
          </Space>
        ) : (
          <Typography.Text type="secondary">Hệ thống</Typography.Text>
        ),
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
      render: (v: string) => v || '-',
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
      title={<><AuditOutlined /> Nhật ký thay đổi</>}
      size="small"
      extra={
        <Space>
          <Select
            placeholder="Hành động"
            allowClear
            style={{ width: 160 }}
            options={Object.entries(actionLabels).map(([value, conf]) => ({
              label: conf.label,
              value,
            }))}
            onChange={(v) => setFilters((prev) => ({ ...prev, action: v }))}
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
