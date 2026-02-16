'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip, Popconfirm, message, Badge } from 'antd';
import {
  EyeOutlined, CheckCircleOutlined, CloseCircleOutlined,
  StopOutlined, PlayCircleOutlined, TeamOutlined, BankOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Affiliate } from '@/types';
import { formatNumber, formatCurrency, formatDate } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

interface CTVTableProps {
  affiliates: Affiliate[];
  loading?: boolean;
  pagination?: object;
  onChange?: (pagination: object, filters: unknown, sorter: unknown) => void;
  onRefresh?: () => void;
}

export default function CTVTable({ affiliates, loading, pagination, onChange, onRefresh }: CTVTableProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleStatus = async (affiliate: Affiliate) => {
    setActionLoading(affiliate.id);
    try {
      await adminAPI.toggleAffiliateStatus(affiliate.id, !affiliate.isActive);
      message.success(
        affiliate.isActive
          ? `Đã vô hiệu hóa CTV${affiliate._count?.children ? ' và các CTV cấp dưới' : ''}`
          : 'Đã kích hoạt CTV',
      );
      onRefresh?.();
    } catch {
      message.error('Thao tác thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [

    { title: 'Mã CTV', dataIndex: 'referralCode', key: 'code', width: 120 },
    {
      title: 'Tên',
      key: 'name',
      width: 220,
      render: (_: unknown, r: Affiliate) => (
        <div>
          <Typography.Text strong>{r.realName}</Typography.Text>
          {r.affiliateType === 'COMPANY' && r.companyName && (
            <>
              <br />
              <Tag color="purple" style={{ fontSize: 11 }}><BankOutlined /> {r.companyName}</Tag>
            </>
          )}
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {r.email || r.nickname}
          </Typography.Text>
        </div>
      ),
    },

    {
      title: 'Mạng lưới',
      key: 'network',
      width: 100,
      render: (_: unknown, r: Affiliate) => {
        const childCount = r._count?.children || 0;
        const networkCount = r.networkMembers || 0;
        if (childCount === 0 && networkCount === 0) {
          return <Typography.Text type="secondary">—</Typography.Text>;
        }
        return (
          <Tooltip title={`${childCount} trực tiếp / ${networkCount} tổng`}>
            <Badge count={networkCount} style={{ backgroundColor: '#722ed1' }} overflowCount={999}>
              <Tag icon={<ApartmentOutlined />} color="default">{childCount}</Tag>
            </Badge>
          </Tooltip>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_: unknown, r: Affiliate) => (
        <Space orientation="vertical" size={2}>
          {r.isActive ? (
            <Tag icon={<CheckCircleOutlined />} color="green">Hoạt động</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="red">Vô hiệu</Tag>
          )}
          {r.isVerified && (
            <Tag color="blue" style={{ fontSize: 11 }}>Đã xác thực</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Hoa hồng',
      dataIndex: 'commissionRate',
      key: 'rate',
      width: 90,
      render: (v: number) => <Tag color="orange">{(v * 100).toFixed(0)}%</Tag>,
    },
    {
      title: 'Tổng thu nhập',
      dataIndex: 'totalEarned',
      key: 'totalEarned',
      width: 140,
      sorter: true,
      render: (v: number, r: Affiliate) => (
        <div>
          <Typography.Text strong style={{ color: '#52c41a' }}>{formatCurrency(v || 0)}</Typography.Text>
          {(r.networkEarned || 0) > 0 && (r.tier ?? 1) < 3 && (
            <>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                Mạng lưới: {formatCurrency(r.networkEarned ?? 0)}
              </Typography.Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Chờ TT',
      dataIndex: 'pendingPayout',
      key: 'pendingPayout',
      width: 120,
      render: (v: number) => (
        <Typography.Text style={{ color: v > 0 ? '#faad14' : undefined }}>{formatCurrency(v || 0)}</Typography.Text>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      sorter: true,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: unknown, r: Affiliate) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => router.push(`/ctv-management/${r.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title={r.isActive
              ? `Vô hiệu hóa CTV này${r._count?.children ? ` và ${r._count.children} CTV cấp dưới` : ''}?`
              : 'Kích hoạt CTV này?'}
            onConfirm={() => handleToggleStatus(r)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title={r.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
              <Button
                icon={r.isActive ? <StopOutlined /> : <PlayCircleOutlined />}
                size="small"
                danger={r.isActive}
                loading={actionLoading === r.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={affiliates}
      columns={columns}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      rowKey="id"
      scroll={{ x: 1600 }}
      size="middle"
    />
  );
}
