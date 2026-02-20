'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Progress, Space, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, StopOutlined, DownloadOutlined } from '@ant-design/icons';
import { CodeBatch } from '@/types';
import { formatDate } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

interface CodeBatchTableProps {
  data: CodeBatch[];
  loading?: boolean;
  pagination?: any;
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  onView?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onExport?: (id: string, batchName: string) => void;
}

export default function CodeBatchTable({
  data,
  loading,
  pagination,
  onChange,
  onView,
  onDeactivate,
  onExport,
}: CodeBatchTableProps) {
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const handleDeactivateConfirm = async (id: string) => {
    try {
      setDeactivatingId(id);
      await adminAPI.deactivateCodeBatch(id, 'Vô hiệu hóa bởi quản trị viên');
      message.success('Đã vô hiệu hóa lô mã');
      onDeactivate?.(id);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể vô hiệu hóa lô mã');
    } finally {
      setDeactivatingId(null);
    }
  };
  const columns = [
    {
      title: 'Tên lô mã',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 200,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Prefix',
      dataIndex: 'codePrefix',
      key: 'codePrefix',
      width: 120,
      render: (prefix: string | null) => prefix ? <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: 3 }}>{prefix}</code> : <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: 'Loại thưởng',
      dataIndex: 'rewardType',
      key: 'rewardType',
      width: 130,
      render: (type: string) => {
        const config: Record<string, { color: string; text: string }> = {
          GOLD: { color: 'gold', text: '🪙 Xu vàng' },
          VIP_DAYS: { color: 'purple', text: '👑 VIP Days' },
        };
        const { color, text } = config[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Giá trị',
      dataIndex: 'rewardValue',
      key: 'rewardValue',
      width: 100,
      align: 'right' as const,
      render: (value: number, record: CodeBatch) => (
        <span style={{ fontWeight: 'bold' }}>
          {record.rewardType === 'GOLD' ? `${value.toLocaleString()} xu` : `${value} ngày`}
        </span>
      ),
    },
    {
      title: 'Số mã',
      dataIndex: 'totalCodes',
      key: 'totalCodes',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      width: 160,
      render: (_: unknown, record: CodeBatch) => (
        <div>
          <Progress
            percent={record.usagePercentage ?? 0}
            size="small"
            status={(record.usagePercentage ?? 0) >= 100 ? 'exception' : 'active'}
            showInfo={false}
          />
          <div style={{ fontSize: 12, textAlign: 'center' }}>
            {record.usedCodes}/{record.totalCodes} ({record.usagePercentage ?? 0}%)
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean, record: CodeBatch) => {
        if (!active) return <Tag color="red">Vô hiệu</Tag>;
        if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
          return <Tag color="orange">Hết hạn</Tag>;
        }
        return <Tag color="green">Hoạt động</Tag>;
      },
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 130,
      render: (date: string) => date ? formatDate(date) : 'Vô thời hạn',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      fixed: 'right' as const,
      render: (_: unknown, record: CodeBatch) => (
        <Space size="small">
          <Tooltip title="Chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView?.(record.id)}
            />
          </Tooltip>
          <Tooltip title="Xuất Excel">
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => onExport?.(record.id, record.batchName ?? '')}
            />
          </Tooltip>
          {record.isActive && (
            <Popconfirm
              title="Xác nhận vô hiệu hóa"
              description="Tất cả mã trong lô này sẽ bị vô hiệu hóa. Hành động không thể hoàn tác."
              onConfirm={() => handleDeactivateConfirm(record.id)}
              okText="Vô hiệu hóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              placement="topRight"
            >
              <Tooltip title="Vô hiệu hóa">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<StopOutlined />}
                  loading={deactivatingId === record.id}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 1400 }}
    />
  );
}
