'use client';

import React from 'react';
import { Card, Spin } from 'antd';
import dynamic from 'next/dynamic';

/* eslint-disable @typescript-eslint/no-explicit-any */
const AreaChart: any = dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart })) as any, { ssr: false });
const Area: any = dynamic(() => import('recharts').then(mod => ({ default: mod.Area })) as any, { ssr: false });
const BarChart: any = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })) as any, { ssr: false });
const Bar: any = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })) as any, { ssr: false });
const LineChart: any = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })) as any, { ssr: false });
const Line: any = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })) as any, { ssr: false });
const XAxis: any = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })) as any, { ssr: false });
const YAxis: any = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })) as any, { ssr: false });
const CartesianGrid: any = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })) as any, { ssr: false });
const Tooltip: any = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })) as any, { ssr: false });
const ResponsiveContainer: any = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })) as any, { ssr: false });
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ChartWidgetProps {
  title: string;
  data: Array<{ date: string; value: number; label?: string; [key: string]: unknown }>;
  type?: 'area' | 'bar' | 'line';
  color?: string;
  height?: number;
  loading?: boolean;
  extra?: React.ReactNode;
  dataKeys?: { key: string; color: string; name: string }[];
  dataKey?: string; // For single series charts
  xAxisKey?: string; // X-axis key (default: 'date')
}

export default function ChartWidget({
  title,
  data,
  type = 'area',
  color = '#1677ff',
  height = 300,
  loading,
  extra,
  dataKeys,
  dataKey = 'value',
  xAxisKey = 'date',
}: ChartWidgetProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    if (dataKeys && dataKeys.length > 0) {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          {dataKeys.map((dk) => (
            <Bar key={dk.key} dataKey={dk.key} fill={dk.color} name={dk.name} />
          ))}
        </BarChart>
      );
    }

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
          </LineChart>
        );
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} />
          </AreaChart>
        );
    }
  };

  return (
    <Card title={title} extra={extra} loading={loading}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </Card>
  );
}
