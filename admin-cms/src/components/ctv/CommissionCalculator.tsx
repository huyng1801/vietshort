'use client';

import React, { useState } from 'react';
import { Card, InputNumber, Typography, Space, Divider } from 'antd';
import { formatCurrency } from '@/lib/admin-utils';

interface CommissionCalculatorProps {
  commissionRate?: number; // decimal e.g. 0.1 = 10%
}

export default function CommissionCalculator({ commissionRate }: CommissionCalculatorProps) {
  const [revenue, setRevenue] = useState(0);
  const [rate, setRate] = useState(commissionRate ? commissionRate * 100 : 10);

  const commission = (revenue * rate) / 100;

  return (
    <Card title="Máy tính hoa hồng">
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Typography.Text>Doanh thu (VNĐ)</Typography.Text>
          <InputNumber value={revenue} onChange={(v) => setRevenue(v || 0)} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </div>
        <div>
          <Typography.Text>Tỷ lệ hoa hồng (%)</Typography.Text>
          <InputNumber value={rate} onChange={(v) => setRate(v || 0)} min={0} max={100} style={{ width: '100%' }} />
        </div>
        <Divider />
        <Typography.Title level={4} style={{ color: '#52c41a' }}>
          Hoa hồng: {formatCurrency(commission)}
        </Typography.Title>
      </Space>
    </Card>
  );
}
