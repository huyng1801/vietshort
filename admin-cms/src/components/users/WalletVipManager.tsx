'use client';

import React, { useState } from 'react';
import {
  Card, Form, InputNumber, Input, Button, Table, Tag, message, Space, Typography,
  Select, Row, Col, Statistic, Popconfirm, Divider,
} from 'antd';
import {
  GoldOutlined, CrownOutlined, DeleteOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { WalletTransaction, VipType } from '@/types';
import { formatDate, formatNumber } from '@/lib/admin-utils';

interface WalletVipManagerProps {
  userId: string;
  currentBalance: number;
  vipTier?: VipType;
  vipExpiresAt?: string;
  transactions: WalletTransaction[];
  onRefresh?: () => void;
}

export default function WalletVipManager({
  userId,
  currentBalance,
  vipTier,
  vipExpiresAt,
  transactions,
  onRefresh,
}: WalletVipManagerProps) {
  const [goldForm] = Form.useForm();
  const [vipForm] = Form.useForm();
  const [loadingGold, setLoadingGold] = useState(false);
  const [loadingVip, setLoadingVip] = useState(false);
  const [removingVip, setRemovingVip] = useState(false);

  const handleAdjustGold = async (values: { amount: number; reason: string }) => {
    setLoadingGold(true);
    try {
      await adminAPI.adjustUserGold(userId, values);
      message.success('Cập nhật xu thành công');
      goldForm.resetFields();
      onRefresh?.();
    } catch {
      message.error('Cập nhật thất bại');
    } finally {
      setLoadingGold(false);
    }
  };

  const handleAdjustVip = async (values: { vipType: string; vipDays: number }) => {
    setLoadingVip(true);
    try {
      await adminAPI.adjustUserVip(userId, values);
      message.success('Cập nhật VIP thành công');
      vipForm.resetFields();
      onRefresh?.();
    } catch {
      message.error('Cập nhật VIP thất bại');
    } finally {
      setLoadingVip(false);
    }
  };

  const handleRemoveVip = async () => {
    setRemovingVip(true);
    try {
      await adminAPI.removeUserVip(userId);
      message.success('Đã xóa VIP');
      onRefresh?.();
    } catch {
      message.error('Xóa VIP thất bại');
    } finally {
      setRemovingVip(false);
    }
  };

  const vipExpired = vipExpiresAt ? new Date(vipExpiresAt) < new Date() : true;

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
    <Space orientation="vertical" style={{ width: '100%' }} size={16}>
      {/* Gold Balance Management */}
      <Card title={<><GoldOutlined /> Quản lý Xu</>} size="small">
        <Statistic
          title="Số dư hiện tại"
          value={formatNumber(currentBalance)}
          suffix="🪙"
          styles={{ content: { color: '#faad14', fontSize: 24 } }}
        />
        <Divider style={{ margin: '12px 0' }} />
        <Form form={goldForm} layout="vertical" onFinish={handleAdjustGold}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="amount" label="Số lượng" rules={[{ required: true, message: 'Nhập số lượng' }]}>
                <InputNumber placeholder="+100 hoặc -50" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Nhập lý do' }]}>
                <Input placeholder="Lý do điều chỉnh" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" loading={loadingGold} block>
                  Cập nhật
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* VIP Management */}
      <Card
        title={<><CrownOutlined /> Quản lý VIP</>}
        size="small"
        extra={
          vipTier && (
            <Popconfirm title="Xác nhận xóa VIP của người dùng?" onConfirm={handleRemoveVip}>
              <Button danger icon={<DeleteOutlined />} loading={removingVip} size="small">
                Xóa VIP
              </Button>
            </Popconfirm>
          )
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Statistic
              title="Loại VIP"
              value={vipTier === 'VIP_GOLD' ? 'VIP Gold' : vipTier === 'VIP_FREEADS' ? 'VIP FreeAds' : 'Thường'}
              prefix={<CrownOutlined style={{ color: vipTier === 'VIP_GOLD' ? '#faad14' : vipTier === 'VIP_FREEADS' ? '#1890ff' : '#d9d9d9' }} />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Hết hạn"
              value={vipExpiresAt ? formatDate(vipExpiresAt) : 'Không có'}
              styles={{ content: { color: vipExpired ? '#f5222d' : '#52c41a', fontSize: 14 } }}
            />
          </Col>
        </Row>
        <Divider style={{ margin: '8px 0 12px' }} />
        <Form form={vipForm} layout="inline" onFinish={handleAdjustVip}>
          <Form.Item name="vipType" rules={[{ required: true, message: 'Chọn loại VIP' }]}>
            <Select placeholder="Loại VIP" style={{ width: 160 }}>
              <Select.Option value="VIP_FREEADS">VIP FreeAds</Select.Option>
              <Select.Option value="VIP_GOLD">VIP Gold</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="vipDays" rules={[{ required: true, message: 'Nhập số ngày' }]}>
            <InputNumber placeholder="Số ngày" min={1} max={365} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingVip}>
              Thêm VIP
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Transaction History */}
      <Card title="Lịch sử giao dịch" size="small">
        <Table
          dataSource={transactions}
          columns={txColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} giao dịch` }}
        />
      </Card>
    </Space>
  );
}
