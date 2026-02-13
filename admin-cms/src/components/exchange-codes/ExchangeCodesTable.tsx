'use client';

import React from 'react';
import { Table, Tag, Button, Space, Progress, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ExchangeCode } from '@/types/admin';
import { formatDate } from '@/lib/admin-utils';

interface ExchangeCodesTableProps {
  codes: ExchangeCode[];
  loading?: boolean;
  pagination?: any;
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ExchangeCodesTable({
  codes,
  loading,
  pagination,
  onChange,
  onEdit,
  onDelete,
}: ExchangeCodesTableProps) {
  
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{code}</span>
      ),
    },
    {
      title: 'Batch/Nhóm',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 150,
      render: (name: string) => name || '-',
    },
    {
      title: 'Loại phần thưởng',
      dataIndex: 'rewardType',
      key: 'rewardType',
      width: 140,
      render: (type: 'GOLD' | 'VIP_DAYS') => {
        const config = {
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
      render: (value: number, record: ExchangeCode) => (
        <span style={{ fontWeight: 'bold' }}>
          {record.rewardType === 'GOLD' ? `${value.toLocaleString()} xu` : `${value} ngày`}
        </span>
      ),
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      width: 120,
      render: (_: unknown, record: ExchangeCode) => {
        const percent = record.usageLimit > 0 ? Math.round((record.usedCount / record.usageLimit) * 100) : 0;
        const isCompleted = record.usedCount >= record.usageLimit;
        
        return (
          <div>
            <Progress 
              percent={percent} 
              size="small" 
              status={isCompleted ? 'exception' : 'active'}
              showInfo={false}
            />
            <div style={{ fontSize: 12, textAlign: 'center' }}>
              {record.usedCount}/{record.usageLimit}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean, record: ExchangeCode) => {
        if (!active) return <Tag color="red">Tắt</Tag>;
        if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
          return <Tag color="orange">Hết hạn</Tag>;
        }
        if (record.usedCount >= record.usageLimit) {
          return <Tag color="volcano">Hết lượt</Tag>;
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
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: ExchangeCode) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button 
              type="link" 
              size="small"
              icon={<EditOutlined />} 
              onClick={() => onEdit?.(record.id)} 
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="link" 
              size="small"
              danger
              icon={<DeleteOutlined />} 
              onClick={() => onDelete?.(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={codes}
      loading={loading}
      rowKey="id"
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 1200 }}
      size="middle"
    />
  );
}