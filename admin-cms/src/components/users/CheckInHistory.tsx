'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, DatePicker, Button, Space, Typography, Statistic, Row, Col } from 'antd';
import { CalendarOutlined, ReloadOutlined, GiftOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { CheckInItem } from '@/types';
import { formatDate, formatNumber } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface CheckInHistoryProps {
  userId: string;
}

export default function CheckInHistory({ userId }: CheckInHistoryProps) {
  const [data, setData] = useState<CheckInItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 30, total: 0 });
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const fetchData = useCallback(async (page = 1, limit = 30) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUserCheckInHistory(userId, { page, limit, ...filters });
      setData(res.data?.items || []);
      const p = res.data?.pagination;
      if (p) setPagination({ current: p.page, pageSize: p.limit, total: p.total });
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalGold = data.reduce((sum, item) => sum + (item.rewardGold ?? item.goldReward ?? 0), 0);

  const dayColors: Record<number, string> = {
    1: 'blue',
    2: 'cyan',
    3: 'green',
    4: 'lime',
    5: 'gold',
    6: 'orange',
    7: 'red',
  };

  const columns: ColumnsType<CheckInItem> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (d: string) => (
        <Space>
          <CalendarOutlined />
          {formatDate(d, 'DD/MM/YYYY')}
        </Space>
      ),
    },
    {
      title: 'Ngày trong streak',
      dataIndex: 'day',
      key: 'day',
      width: 140,
      render: (day: number) => (
        <Tag color={dayColors[day] || 'default'}>Ngày {day}/7</Tag>
      ),
    },
    {
      title: 'Xu thưởng',
      dataIndex: 'rewardGold',
      key: 'rewardGold',
      width: 120,
      render: (v: number) => (
        <Typography.Text style={{ color: '#faad14' }}>
          +{formatNumber(v)} 🪙
        </Typography.Text>
      ),
    },
    {
      title: 'Thời gian điểm danh',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (d: string) => formatDate(d),
    },
  ];

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="Tổng lần điểm danh" 
              value={pagination.total} 
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="Tổng xu nhận (trang này)" 
              value={formatNumber(totalGold)} 
              prefix={<GiftOutlined />}
              suffix="🪙"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<><CalendarOutlined /> Lịch sử điểm danh</>}
        size="small"
        extra={
          <Space>
            <RangePicker
              onChange={(dates) => {
                setFilters((prev) => ({
                  ...prev,
                  dateFrom: dates?.[0]?.toISOString(),
                  dateTo: dates?.[1]?.toISOString(),
                }));
              }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchData()} />
          </Space>
        }
      >
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} mục`,
            pageSizeOptions: ['10', '20', '30', '50'],
          }}
          onChange={(p) => fetchData(p.current, p.pageSize)}
        />
      </Card>
    </Space>
  );
}
