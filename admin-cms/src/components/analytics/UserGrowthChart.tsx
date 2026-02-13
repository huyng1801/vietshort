'use client';

import React from 'react';
import { Card, Empty } from 'antd';
import dynamic from 'next/dynamic';

interface UserGrowthChartProps {
  data: { date: string; newUsers: number; totalUsers: number }[];
  loading?: boolean;
}

const UserGrowthChartInner = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = mod;
      const Component = ({ data }: { data: { date: string; newUsers: number; totalUsers: number }[] }) => (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="newUsers" stroke="#1677ff" name="Người dùng mới" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="totalUsers" stroke="#52c41a" name="Tổng người dùng" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
      Component.displayName = 'UserGrowthChartInner';
      return { default: Component };
    }),
  { ssr: false },
);

export default function UserGrowthChart({ data, loading }: UserGrowthChartProps) {
  return (
    <Card title="Tăng trưởng người dùng" loading={loading}>
      {data.length === 0 ? (
        <Empty description="Chưa có dữ liệu" />
      ) : (
        <UserGrowthChartInner data={data} />
      )}
    </Card>
  );
}
