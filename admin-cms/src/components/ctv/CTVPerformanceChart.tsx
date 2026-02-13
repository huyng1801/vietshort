'use client';

import React from 'react';
import { Card, Spin } from 'antd';
import dynamic from 'next/dynamic';

interface CTVPerformanceChartProps {
  data: { date: string; clicks: number; registrations: number; revenue: number }[];
  loading?: boolean;
}

const PerformanceChartInner = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = mod;

      const Component = ({ data }: { data: CTVPerformanceChartProps['data'] }) => (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="clicks" stroke="#1677ff" name="Clicks" />
            <Line type="monotone" dataKey="registrations" stroke="#52c41a" name="Đăng ký" />
            <Line type="monotone" dataKey="revenue" stroke="#faad14" name="Doanh thu" />
          </LineChart>
        </ResponsiveContainer>
      );
      return { default: Component };
    }),
  { ssr: false, loading: () => <Spin /> },
);

export default function CTVPerformanceChart({ data, loading }: CTVPerformanceChartProps) {
  return (
    <Card title="Hiệu suất CTV" loading={loading}>
      <PerformanceChartInner data={data} />
    </Card>
  );
}
