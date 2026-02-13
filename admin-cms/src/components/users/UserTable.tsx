'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Avatar, Typography, Space, Tooltip, Popconfirm, message } from 'antd';
import { EyeOutlined, UserOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { User } from '@/types/admin';
import { formatDate, formatNumber } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  pagination?: object;
  onChange?: (pagination: object, filters: unknown, sorter: unknown) => void;
  onRefresh?: () => void;
}

export default function UserTable({ users, loading, pagination, onChange, onRefresh }: UserTableProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleLockToggle = async (user: User) => {
    setActionLoading(user.id);
    try {
      if (user.isLocked) {
        await adminAPI.unlockUser(user.id);
        message.success('Đã mở khóa người dùng');
      } else {
        await adminAPI.lockUser(user.id, 'Khóa bởi quản trị viên');
        message.success('Đã khóa người dùng');
      }
      onRefresh?.();
    } catch {
      message.error('Thao tác thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const getVipColor = (vipTier?: string | null) => {
    if (!vipTier) return 'default';
    if (vipTier === 'VIP_GOLD') return 'gold';
    return 'default';
  };

  const getVipLabel = (vipTier?: string | null) => {
    if (!vipTier) return 'Thường';
    if (vipTier === 'VIP_GOLD') return 'VIP Gold';
    return vipTier;
  };

  const getRegistrationSourceText = (source?: string) => {
    const map: Record<string, string> = {
      web: 'Web',
      android: 'Android',
      ios: 'iOS',
      guest: 'Khách',
    };
    return source ? map[source] || source : '-';
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 280,
      render: (_: unknown, record: User) => (
        <Space>
          <Avatar src={record.avatar || undefined} icon={<UserOutlined />} />
          <div>
            <Typography.Text strong>{record.nickname || 'Không có tên'}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.email || record.phone || `ID: ${record.id}`}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'VIP',
      dataIndex: 'vipTier',
      key: 'vipTier',
      width: 110,
      render: (vipTier: string | null) => (
        <Tag color={getVipColor(vipTier)}>{getVipLabel(vipTier)}</Tag>
      ),
    },
    {
      title: 'Số dư',
      dataIndex: 'goldBalance',
      key: 'goldBalance',
      width: 110,
      sorter: true,
      render: (v: number) => (
        <Typography.Text strong style={{ color: '#faad14' }}>
          {formatNumber(v || 0)} 🪙
        </Typography.Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 180,
      render: (_: unknown, record: User) => (
        <Space direction="vertical" size={2}>
          {record.isLocked ? (
            <Tag icon={<LockOutlined />} color="red">Khóa</Tag>
          ) : (
            <Tag icon={<UnlockOutlined />} color="green">Hoạt động</Tag>
          )}
          <Space size={4}>
            {record.isActive && (
              <Tooltip title="Đang hoạt động">
                <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 11 }}>Active</Tag>
              </Tooltip>
            )}
            {record.isEmailVerified && (
              <Tooltip title="Email đã xác thực">
                <Tag icon={<MailOutlined />} color="blue" style={{ fontSize: 11 }}>Verified</Tag>
              </Tooltip>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'registrationSource',
      key: 'registrationSource',
      width: 90,
      render: (source: string) => (
        <Typography.Text style={{ fontSize: 12 }}>
          {getRegistrationSourceText(source)}
        </Typography.Text>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: true,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => router.push(`/users/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title={record.isLocked ? 'Mở khóa người dùng này?' : 'Khóa người dùng này?'}
            onConfirm={() => handleLockToggle(record)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title={record.isLocked ? 'Mở khóa' : 'Khóa'}>
              <Button
                icon={record.isLocked ? <UnlockOutlined /> : <LockOutlined />}
                size="small"
                danger={!record.isLocked}
                loading={actionLoading === record.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={users}
      columns={columns}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      rowKey="id"
      scroll={{ x: 1000 }}
      size="middle"
    />
  );
}
