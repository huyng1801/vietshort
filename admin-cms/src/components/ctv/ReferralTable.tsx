'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Avatar, Typography, Space, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { CtvReferral } from '@/types';
import { formatCurrency, formatDate } from '@/lib/admin-utils';
import { usePagination } from '@/hooks/usePagination';
import adminAPI from '@/lib/admin-api';

interface ReferralTableProps {
  affiliateId: string;
}

export default function ReferralTable({ affiliateId }: ReferralTableProps) {
  const [referrals, setReferrals] = useState<CtvReferral[]>([]);
  const [loading, setLoading] = useState(false);
  const { params, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 10 });

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAffiliateReferrals(affiliateId, { page: params.page, limit: params.limit });
      const data = res.data?.data || res.data?.items || [];
      const totalCount = res.data?.meta?.total || res.data?.total || data.length;
      setReferrals(data);
      setTotal(totalCount);
    } catch {
      message.error('Không thể tải danh sách giới thiệu');
    } finally {
      setLoading(false);
    }
  }, [affiliateId, params.page, params.limit, setTotal]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 200,
      render: (_: unknown, r: CtvReferral) => (
        <Space>
          <Avatar src={r.user?.avatar || undefined} icon={<UserOutlined />} size="small" />
          <div>
            <Typography.Text strong>{r.user?.nickname || 'N/A'}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>{r.user?.email || r.userId}</Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Ngày click',
      dataIndex: 'clickedAt',
      key: 'clickedAt',
      width: 130,
      render: (d: string) => d ? formatDate(d) : '-',
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 130,
      render: (d: string) => d ? formatDate(d) : <Tag color="default">Chưa đăng ký</Tag>,
    },
    {
      title: 'Mua hàng đầu tiên',
      dataIndex: 'firstPurchaseAt',
      key: 'firstPurchaseAt',
      width: 130,
      render: (d: string) => d ? formatDate(d) : <Tag color="default">Chưa mua</Tag>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 130,
      render: (v: number) => formatCurrency(v || 0),
    },
    {
      title: 'Hoa hồng',
      dataIndex: 'totalCommission',
      key: 'totalCommission',
      width: 130,
      render: (v: number) => (
        <Typography.Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(v || 0)}
        </Typography.Text>
      ),
    },
  ];

  return (
    <Table
      dataSource={referrals}
      columns={columns}
      loading={loading}
      pagination={{ ...paginationConfig, total }}
      onChange={handleTableChange}
      rowKey="id"
      size="small"
    />
  );
}
