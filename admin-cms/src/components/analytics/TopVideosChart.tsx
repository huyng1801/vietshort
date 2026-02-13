'use client';

import React from 'react';
import { Card, Empty } from 'antd';
import dynamic from 'next/dynamic';

interface TopVideosChartProps {
  data: { title: string; views: number }[];
  loading?: boolean;
}

const TopVideosChartInner = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
      const Component = ({ data }: { data: { title: string; views: number }[] }) => (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" fontSize={12} />
            <YAxis type="category" dataKey="title" fontSize={12} width={90} />
            <Tooltip />
            <Bar dataKey="views" fill="#722ed1" name="Lượt xem" />
          </BarChart>
        </ResponsiveContainer>
      );
      Component.displayName = 'TopVideosChartInner';
      return { default: Component };
    }),
  { ssr: false },
);

export default function TopVideosChart({ data, loading }: TopVideosChartProps) {
  return (
    <Card title="Top Video theo lượt xem" loading={loading}>
      {data.length === 0 ? (
        <Empty description="Chưa có dữ liệu" />
      ) : (
        <TopVideosChartInner data={data} />
      )}
    </Card>
  );
}
