'use client';

import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  precision?: number;
  growthRate?: number;
  loading?: boolean;
  formatter?: (value: number | string) => string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  precision,
  growthRate,
  loading,
  icon,
  color,
}: StatCardProps) {
  return (
    <Card loading={loading} hoverable>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Statistic title={title} value={value} prefix={prefix} suffix={suffix} precision={precision} />
        {icon && (
          <div style={{ fontSize: 32, color: color || '#1890ff', opacity: 0.8 }}>
            {icon}
          </div>
        )}
      </div>
      {growthRate !== undefined && (
        <div style={{ marginTop: 8, fontSize: 13 }}>
          {growthRate >= 0 ? (
            <span style={{ color: '#3f8600' }}>
              <ArrowUpOutlined /> {growthRate}%
            </span>
          ) : (
            <span style={{ color: '#cf1322' }}>
              <ArrowDownOutlined /> {Math.abs(growthRate)}%
            </span>
          )}
          <span style={{ color: '#999', marginLeft: 8 }}>so với hôm qua</span>
        </div>
      )}
    </Card>
  );
}
