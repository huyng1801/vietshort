'use client';

import React from 'react';
import { Card, Empty } from 'antd';
import dynamic from 'next/dynamic';
import { RevenueData } from '@/types/dashboard';

interface RevenueChartProps {
  data: RevenueData[];
  loading?: boolean;
}

const RevenueChartInner = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = mod;
      const Component = ({ data }: { data: RevenueData[] }) => (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="vnpay" fill="#1677ff" name="VNPay" stackId="a" />
            <Bar dataKey="momo" fill="#d6249f" name="MoMo" stackId="a" />
            <Bar dataKey="iap" fill="#52c41a" name="IAP" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      );
      Component.displayName = 'RevenueChartInner';
      return { default: Component };
    }),
  { ssr: false },
);

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  return (
    <Card title="Thống kê doanh thu" loading={loading}>
      {data.length === 0 ? (
        <Empty description="Chưa có dữ liệu" />
      ) : (
        <RevenueChartInner data={data} />
      )}
    </Card>
  );
}
