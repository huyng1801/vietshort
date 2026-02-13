'use client';

import React from 'react';
import { Descriptions, Tag, Card, Avatar, Space, Typography, Button, Popconfirm, message } from 'antd';
import { UserOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { User } from '@/types/admin';
import { formatDate, formatNumber } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

interface UserDetailsProps {
  user: User;
  onRefresh?: () => void;
}

export default function UserDetails({ user, onRefresh }: UserDetailsProps) {
  const handleLock = async () => {
    try {
      await adminAPI.lockUser(user.id, 'Khóa bởi quản trị viên');
      message.success('Đã khóa người dùng');
      onRefresh?.();
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  const handleUnlock = async () => {
    try {
      await adminAPI.unlockUser(user.id);
      message.success('Đã mở khóa');
      onRefresh?.();
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  return (
    <Card
      title={
        <Space>
          <Avatar size={48} src={user.avatar || undefined} icon={<UserOutlined />} />
          <div>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {user.nickname || 'Không có tên'}
            </Typography.Title>
            <Typography.Text type="secondary">{user.email}</Typography.Text>
          </div>
        </Space>
      }
      extra={
        user.isLocked ? (
          <Popconfirm title="Mở khóa người dùng?" onConfirm={handleUnlock}>
            <Button icon={<UnlockOutlined />} type="primary">Mở khóa</Button>
          </Popconfirm>
        ) : (
          <Popconfirm title="Khóa người dùng này?" onConfirm={handleLock}>
            <Button icon={<LockOutlined />} danger>Khóa</Button>
          </Popconfirm>
        )
      }
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
        <Descriptions.Item label="Biệt danh">{user.nickname || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">
          <Space>
            {user.email || '-'}
            {user.isEmailVerified && <MailOutlined style={{ color: '#1890ff' }} />}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Điện thoại">{user.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Loại thành viên">
          {user.vipTier === 'VIP_GOLD' ? (
            <Tag color="gold">VIP Gold</Tag>
          ) : (
            <Tag>Thường</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="VIP hết hạn">
          {user.vipExpiresAt ? formatDate(user.vipExpiresAt) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Số dư Xu">
          <Typography.Text strong style={{ color: '#faad14', fontSize: 16 }}>
            {formatNumber(user.goldBalance || 0)} 🪙
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Space direction="vertical" size={4}>
            {user.isLocked ? (
              <Tag icon={<LockOutlined />} color="red">Đã khóa</Tag>
            ) : (
              <Tag icon={<UnlockOutlined />} color="green">Không khóa</Tag>
            )}
            {user.isActive && <Tag icon={<CheckCircleOutlined />} color="success">Đang hoạt động</Tag>}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Nguồn đăng ký">
          {user.registrationSource || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Thiết bị">{user.deviceId || '-'}</Descriptions.Item>
        <Descriptions.Item label="Google ID">{user.googleId || '-'}</Descriptions.Item>
        <Descriptions.Item label="Facebook ID">{user.facebookId || '-'}</Descriptions.Item>
        <Descriptions.Item label="Apple ID">{user.appleId || '-'}</Descriptions.Item>
        <Descriptions.Item label="TikTok ID">{user.tiktokId || '-'}</Descriptions.Item>
        <Descriptions.Item label="Hoạt động cuối">
          {user.lastActiveAt ? formatDate(user.lastActiveAt) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đăng ký" span={2}>
          {formatDate(user.createdAt)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
