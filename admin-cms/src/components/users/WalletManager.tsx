'use client';

import React, { useState } from 'react';
import { Card, Form, InputNumber, Input, Button, Table, Tag, message, Space, Typography } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { WalletTransaction } from '@/types/admin';
import { formatDate, formatNumber } from '@/lib/admin-utils';

interface WalletManagerProps {
  userId: string;
  currentBalance: number;
  transactions: WalletTransaction[];
  onRefresh?: () => void;
}

export default function WalletManager({
  userId,
  currentBalance,
  transactions,
  onRefresh,
}: WalletManagerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAdjust = async (values: { amount: number; reason: string }) => {
    setLoading(true);
    try {
      await adminAPI.updateUserBalance(userId, values);
      message.success('Cập nhật số dư thành công');
      form.resetFields();
      onRefresh?.();
    } catch {
      message.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const txColumns = [
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, { color: string; label: string }> = {
          ADMIN_ADJUST: { color: 'blue', label: 'Điều chỉnh' },
          PAYMENT: { color: 'green', label: 'Nạp tiền' },
          REFUND: { color: 'orange', label: 'Hoàn tiền' },
          BONUS: { color: 'purple', label: 'Thưởng' },
          VIDEO_UNLOCK: { color: 'cyan', label: 'Mở khóa video' },
          EXCHANGE_REDEEM: { color: 'magenta', label: 'Đổi thưởng' },
          VIP_UPGRADE: { color: 'gold', label: 'Nâng VIP' },
        };
        const config = typeMap[type] || { color: 'default', label: type };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'rewardValue',
      key: 'rewardValue',
      width: 120,
      render: (v: number) => (
        <Typography.Text strong style={{ color: v > 0 ? '#52c41a' : '#f5222d' }}>
          {v > 0 ? '+' : ''}{formatNumber(v)}
        </Typography.Text>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
          PENDING: { color: 'orange', label: 'Chờ xử lý' },
          COMPLETED: { color: 'green', label: 'Hoàn thành' },
          FAILED: { color: 'red', label: 'Thất bại' },
          CANCELLED: { color: 'default', label: 'Hủy' },
        };
        const config = statusMap[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
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
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card title="Điều chỉnh số dư">
        <Typography.Text style={{ fontSize: 16 }}>
          Số dư hiện tại: <Typography.Text strong style={{ color: '#faad14', fontSize: 20 }}>{formatNumber(currentBalance)} 🪙</Typography.Text>
        </Typography.Text>

        <Form form={form} layout="inline" onFinish={handleAdjust} style={{ marginTop: 16 }}>
          <Form.Item name="amount" rules={[{ required: true, message: 'Nhập số lượng' }]}>
            <InputNumber placeholder="Số lượng (âm để trừ)" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="reason" rules={[{ required: true, message: 'Nhập lý do' }]}>
            <Input placeholder="Lý do điều chỉnh" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Lịch sử giao dịch">
        <Table
          dataSource={transactions}
          columns={txColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  );
}
