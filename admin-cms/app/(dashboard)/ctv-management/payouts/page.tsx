'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Space, Table, Tag, Typography, Popconfirm, message } from 'antd';
import { ReloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import { formatCurrency, formatDate } from '@/lib/admin-utils';
import PayoutsFilters from '@/components/ctv/PayoutsFilters';
import type { CtvPayout, PayoutStatus } from '@/types';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<CtvPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const { params, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  // Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | undefined>();

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, any> = {
        page: params.page,
        limit: params.limit,
      };
      if (search && search.trim()) {
        apiParams.search = search;
      }
      if (status && status !== '') {
        apiParams.status = status;
      }
      if (dateRange && dateRange.length === 2) {
        apiParams.dateFrom = dateRange[0].format('YYYY-MM-DD');
        apiParams.dateTo = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await adminAPI.getPendingPayouts(apiParams);
      const data = res.data?.data || res.data?.items || [];
      const totalCount = res.data?.meta?.total || res.data?.total || data.length;
      setPayouts(data);
      setTotal(totalCount);
    } catch {
      message.error('Không thể tải danh sách yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, search, status, dateRange, setTotal]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approvePayout(id);
      message.success('Đã duyệt thanh toán');
      fetchPayouts();
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectPayout(id, 'Không đủ điều kiện');
      message.success('Đã từ chối');
      fetchPayouts();
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  const getPayoutStatusColor = (status: PayoutStatus) => {
    const colors: Record<string, string> = {
      PENDING: 'orange',
      APPROVED: 'green',
      PROCESSING: 'blue',
      COMPLETED: 'cyan',
      REJECTED: 'red',
    };
    return colors[status] || 'default';
  };

  const getPayoutStatusText = (status: PayoutStatus) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      PROCESSING: 'Đang xử lý',
      COMPLETED: 'Hoàn thành',
      REJECTED: 'Từ chối',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'CTV',
      key: 'affiliate',
      width: 150,
      render: (_: unknown, r: CtvPayout) => (
        <div>
          <Typography.Text strong>{r.affiliate?.realName || '-'}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{r.affiliate?.nickname || ''}</Typography.Text>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (v: number) => (
        <Typography.Text strong>{formatCurrency(v || 0)}</Typography.Text>
      ),
    },
    { title: 'Ngân hàng', dataIndex: 'bankName', key: 'bank', width: 120 },
    { title: 'Số TK', dataIndex: 'bankAccount', key: 'account', width: 150 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: PayoutStatus) => <Tag color={getPayoutStatusColor(s)}>{getPayoutStatusText(s)}</Tag>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'date',
      width: 130,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Ngày xử lý',
      dataIndex: 'processedAt',
      key: 'processedAt',
      width: 130,
      render: (d: string) => d ? formatDate(d) : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: unknown, r: CtvPayout) =>
        r.status === 'PENDING' ? (
          <Space size="small">
            <Button icon={<CheckOutlined />} size="small" type="primary" onClick={() => handleApprove(r.id)}>
              Duyệt
            </Button>
            <Popconfirm title="Từ chối yêu cầu rút tiền?" onConfirm={() => handleReject(r.id)} okText="Xác nhận" cancelText="Hủy">
              <Button icon={<CloseOutlined />} size="small" danger>
                Từ chối
              </Button>
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold m-0">Yêu cầu rút tiền</h1>

      </div>

      <PayoutsFilters
        search={search}
        status={status}
        dateRange={dateRange}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onDateRangeChange={setDateRange}
        onSearch={fetchPayouts}
        onReset={() => {
          setSearch('');
          setStatus('');
          setDateRange(undefined);
        }}
      />

      <Table
        dataSource={payouts}
        columns={columns}
        loading={loading}
        pagination={{ ...paginationConfig, total }}
        onChange={handleTableChange}
        rowKey="id"
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
