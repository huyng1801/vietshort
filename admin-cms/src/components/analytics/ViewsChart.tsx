'use client';

import React from 'react';
import { Card, Empty } from 'antd';
import dynamic from 'next/dynamic';

interface ViewsChartProps {
  data: { date: string; views: number }[];
  loading?: boolean;
}

const ViewsChartInner = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
      const Component = ({ data }: { data: { date: string; views: number }[] }) => (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Area type="monotone" dataKey="views" stroke="#1677ff" fill="#1677ff" fillOpacity={0.15} name="Lượt xem" />
          </AreaChart>
        </ResponsiveContainer>
      );
      Component.displayName = 'ViewsChartInner';
      return { default: Component };
    }),
  { ssr: false },
);

export default function ViewsChart({ data, loading }: ViewsChartProps) {
  return (
    <Card title="Thống kê lượt xem" loading={loading}>
      {data.length === 0 ? (
        <Empty description="Chưa có dữ liệu" />
      ) : (
        <ViewsChartInner data={data} />
      )}
    </Card>
  );
}
