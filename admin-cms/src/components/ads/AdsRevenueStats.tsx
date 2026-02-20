'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Space, Typography, Empty } from 'antd';
import {
  DollarOutlined,
  EyeOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { AdRevenueSummary } from '@/types';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function AdsRevenueStats() {
  const [summary, setSummary] = useState<AdRevenueSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<string>('7d');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAdRevenueSummary({ period });
      setSummary(res.data?.data || res.data);
    } catch {
      // Silent - stats are optional
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const todayRevenue = summary?.today?.revenue || 0;
  const yesterdayRevenue = summary?.yesterday?.revenue || 0;
  const revenueDiff = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100)
    : 0;

  return (
    <div>
      {/* Period Filter */}
      <Space className="mb-4">
        <Select
          value={period}
          onChange={setPeriod}
          style={{ width: 160 }}
          options={[
            { label: '7 ngày qua', value: '7d' },
            { label: '30 ngày qua', value: '30d' },
            { label: 'Tháng này', value: 'month' },
            { label: 'Quý này', value: 'quarter' },
          ]}
        />
      </Space>

      {/* Revenue Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Doanh thu hôm nay"
              value={todayRevenue}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix={
                revenueDiff !== 0 ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: revenueDiff > 0 ? '#52c41a' : '#ff4d4f',
                    }}
                  >
                    {revenueDiff > 0 ? <RiseOutlined /> : <FallOutlined />}
                    {Math.abs(revenueDiff).toFixed(1)}%
                  </Text>
                ) : null
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="Impressions hôm nay"
              value={summary?.today?.impressions || 0}
              prefix={<EyeOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="CTR trung bình"
              value={summary?.today?.ctr || 0}
              precision={2}
              suffix="%"
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} size="small" style={{ minHeight: 100 }}>
            <Statistic
              title="eCPM"
              value={summary?.today?.ecpm || 0}
              precision={2}
              prefix={<BarChartOutlined style={{ color: '#eb2f96' }} />}
              suffix="$"
            />
          </Card>
        </Col>
      </Row>

      {/* Weekly / Monthly summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card loading={loading} size="small" title="📊 Tuần này">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Doanh thu"
                  value={summary?.thisWeek?.revenue || 0}
                  precision={2}
                  prefix="$"
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Impressions"
                  value={summary?.thisWeek?.impressions || 0}
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Clicks"
                  value={summary?.thisWeek?.clicks || 0}
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card loading={loading} size="small" title="📅 Tháng này">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Doanh thu"
                  value={summary?.thisMonth?.revenue || 0}
                  precision={2}
                  prefix="$"
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Impressions"
                  value={summary?.thisMonth?.impressions || 0}
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Clicks"
                  value={summary?.thisMonth?.clicks || 0}
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Revenue by Ad Type */}
      <Card loading={loading} size="small" title="💰 Doanh thu theo loại quảng cáo" style={{ marginBottom: 24 }}>
        {summary?.byType ? (
          <Row gutter={[16, 16]}>
            {(Object.entries(summary.byType) as [string, { revenue: number; impressions: number }][]).map(
              ([type, stats]) => (
                <Col xs={12} sm={6} key={type}>
                  <Card type="inner" size="small">
                    <Statistic
                      title={
                        type === 'BANNER'
                          ? 'Banner'
                          : type === 'INTERSTITIAL'
                            ? 'Interstitial'
                            : type === 'REWARD_VIDEO'
                              ? 'Reward Video'
                              : 'Native'
                      }
                      value={stats.revenue || 0}
                      precision={2}
                      prefix="$"
                      valueStyle={{ fontSize: 16 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {(stats.impressions || 0).toLocaleString()} impressions
                    </Text>
                  </Card>
                </Col>
              ),
            )}
          </Row>
        ) : (
          <Empty description="Chưa có dữ liệu doanh thu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* Trend Chart Placeholder */}
      <Card size="small" title="📈 Xu hướng doanh thu">
        {summary?.trend && summary.trend.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Ngày</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Doanh thu</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Impressions</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Clicks</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>CTR</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>eCPM</th>
                </tr>
              </thead>
              <tbody>
                {summary.trend.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '6px 12px' }}>{row.date}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', color: '#52c41a', fontWeight: 500 }}>
                      ${(row.revenue || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      {(row.impressions || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      {(row.clicks || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      {(row.ctr || 0).toFixed(2)}%
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      ${(row.ecpm || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty description="Chưa có dữ liệu xu hướng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  );
}
