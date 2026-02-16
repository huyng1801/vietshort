'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Space, Typography, Avatar, Badge, Empty, Statistic, Row, Col } from 'antd';
import { TeamOutlined, UserOutlined, DollarOutlined, LinkOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { UserReferralItem } from '@/types';
import { formatDate, formatNumber, formatCurrency } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

export interface UserReferralData {
  isAffiliate: boolean;
  affiliate: {
    id: string;
    affiliateCode: string;
    tier: string;
  } | null;
  referredBy: {
    affiliateNickname: string;
    affiliateEmail: string;
    affiliateCode: string;
  } | null;
  referrals: {
    items: UserReferralItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

interface UserReferralsProps {
  userId: string;
}

export default function UserReferrals({ userId }: UserReferralsProps) {
  const [data, setData] = useState<UserReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchData = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserReferrals(userId, { page, limit });
      setData(res.data);
      const p = res.data?.referrals?.pagination;
      if (p) setPagination({ current: p.page, pageSize: p.limit, total: p.total });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  if (!loading && (!data || (!data.isAffiliate && !data.referredBy))) {
    return (
      <Card title={<><TeamOutlined /> Thành viên giới thiệu</>} size="small">
        <Empty description="Người dùng này không phải CTV và không được giới thiệu bởi ai" />
      </Card>
    );
  }

  const columns: ColumnsType<UserReferralItem> = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar size={32} src={record.user?.avatar || undefined} icon={<UserOutlined />} />
          <div>
            <Typography.Text strong>{record.user?.nickname}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {record.user?.email}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'VIP',
      key: 'vip',
      width: 100,
      render: (_, record) =>
        record.user?.vipTier ? (
          <Tag color="gold">{record.user?.vipTier}</Tag>
        ) : (
          <Tag>Thường</Tag>
        ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 110,
      render: (_, record) =>
        record.user?.isActive ? (
          <Badge status="success" text="Hoạt động" />
        ) : (
          <Badge status="default" text="Không HĐ" />
        ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 130,
      render: (d: string) => (d ? formatDate(d, 'DD/MM/YYYY') : '-'),
    },
    {
      title: 'Mua hàng đầu',
      dataIndex: 'firstPurchaseAt',
      key: 'firstPurchaseAt',
      width: 130,
      render: (d: string) =>
        d ? formatDate(d, 'DD/MM/YYYY') : <Tag color="default">Chưa mua</Tag>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 120,
      render: (v: number) => (
        <Typography.Text style={{ color: '#52c41a' }}>
          {formatCurrency(v / 100)}
        </Typography.Text>
      ),
    },
    {
      title: 'Hoa hồng',
      dataIndex: 'totalCommission',
      key: 'totalCommission',
      width: 120,
      render: (v: number) => (
        <Typography.Text style={{ color: '#1890ff' }}>
          {formatCurrency(v / 100)}
        </Typography.Text>
      ),
    },
  ];

  const totalRevenue = data?.referrals?.items?.reduce((s, i) => s + (i.totalRevenue ?? 0), 0) || 0;
  const totalCommission = data?.referrals?.items?.reduce((s, i) => s + (i.totalCommission ?? 0), 0) || 0;

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      {data?.referredBy && (
        <Card size="small" title={<><LinkOutlined /> Được giới thiệu bởi</>}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="CTV" value={data.referredBy.affiliateNickname} />
            </Col>
            <Col span={8}>
              <Statistic title="Email" value={data.referredBy.affiliateEmail} />
            </Col>
            <Col span={8}>
              <Statistic title="Mã giới thiệu" value={data.referredBy.affiliateCode} prefix={<LinkOutlined />} />
            </Col>
          </Row>
        </Card>
      )}

      {data?.affiliate && (
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Mã CTV" value={data.affiliate.affiliateCode} prefix={<LinkOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Cấp bậc" value={data.affiliate.tier} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Tổng thành viên" value={pagination.total} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Tổng hoa hồng" value={formatCurrency(totalCommission / 100)} prefix={<DollarOutlined />} />
            </Card>
          </Col>
        </Row>
      )}

      <Card title={<><TeamOutlined /> Danh sách thành viên giới thiệu</>} size="small">
        <Table
          dataSource={data?.referrals?.items || []}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} mục`,
          }}
          onChange={(p) => fetchData(p.current, p.pageSize)}
        />
      </Card>
    </Space>
  );
}
