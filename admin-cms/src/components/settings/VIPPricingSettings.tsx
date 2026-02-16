'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Tag,
  Alert,
  message,
  Typography,
} from 'antd';
import { SaveOutlined, CrownOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { VipPlan } from '@/types';

const { Text } = Typography;

export default function VIPPricingSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [vipPlans, setVipPlans] = useState<VipPlan[]>([]);

  const fetchVipPlans = useCallback(async () => {
    setFetching(true);
    try {
      const res = await adminAPI.getVipPlans();
      const plans: VipPlan[] = res.data?.data || res.data || [];
      setVipPlans(plans);

      // Map plans to form fields
      const formData: Record<string, Record<string, unknown>> = {};
      plans.forEach((plan) => {
        const key = plan.vipType === 'VIP_FREEADS' ? 'freeads' : 'gold';
        const duration =
          plan.durationDays === 30
            ? 'month1'
            : plan.durationDays === 90
              ? 'month3'
              : 'year1';
        if (!formData[key]) formData[key] = {};
        formData[key][duration] = plan.priceVnd;
        formData[key][`${duration}_id`] = plan.id;
      });
      form.setFieldsValue(formData);
    } catch {
      message.error('Không thể tải bảng giá VIP');
    } finally {
      setFetching(false);
    }
  }, [form]);

  useEffect(() => {
    fetchVipPlans();
  }, [fetchVipPlans]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const updates: Promise<any>[] = [];

      for (const tier of ['freeads', 'gold'] as const) {
        const data = values[tier];
        if (!data) continue;
        for (const dur of ['month1', 'month3', 'year1'] as const) {
          if (data[dur] !== undefined && data[`${dur}_id`]) {
            updates.push(adminAPI.updateVipPlanPrice(data[`${dur}_id`], data[dur]));
          }
        }
      }

      await Promise.all(updates);
      message.success('Đã cập nhật bảng giá VIP');
      fetchVipPlans();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể lưu bảng giá');
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (v: number | undefined) => {
    if (!v) return '0';
    return `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseVND = (v: string | undefined) => {
    if (!v) return 0;
    return parseInt(v.replace(/,/g, ''), 10) || 0;
  };

  const renderTierCard = (
    tier: 'freeads' | 'gold',
    title: string,
    tagColor: string,
    alertMsg: string,
    alertType: 'info' | 'warning',
    discounts: Record<string, string>,
  ) => (
    <Card
      type="inner"
      title={<Tag color={tagColor}>{title}</Tag>}
      style={{ marginBottom: 24 }}
    >
      <Alert message={alertMsg} type={alertType} showIcon style={{ marginBottom: 16 }} />

      {/* Hidden ID fields */}
      <Form.Item name={[tier, 'month1_id']} hidden><Input /></Form.Item>
      <Form.Item name={[tier, 'month3_id']} hidden><Input /></Form.Item>
      <Form.Item name={[tier, 'year1_id']} hidden><Input /></Form.Item>

      <Row gutter={16}>
        {([
          { dur: 'month1', label: 'Gói 1 tháng (30 ngày)', placeholder: tier === 'freeads' ? '19,000' : '49,000' },
          { dur: 'month3', label: 'Gói 3 tháng (90 ngày)', placeholder: tier === 'freeads' ? '49,000' : '129,000' },
          { dur: 'year1', label: 'Gói 1 năm (365 ngày)', placeholder: tier === 'freeads' ? '179,000' : '469,000' },
        ] as const).map(({ dur, label, placeholder }) => (
          <Col span={8} key={dur}>
            <Form.Item
              name={[tier, dur]}
              label={label}
              rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={formatVND}
                parser={parseVND}
                addonAfter="₫"
                placeholder={placeholder}
              />
            </Form.Item>
            {discounts[dur] && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {discounts[dur]}
              </Text>
            )}
          </Col>
        ))}
      </Row>
    </Card>
  );

  return (
    <Card title={<><CrownOutlined /> Bảng giá VIP</>} loading={fetching}>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ maxWidth: 700 }}>
        {renderTierCard(
          'freeads',
          'VIP FreeAds - Xem không quảng cáo',
          'blue',
          'VIP FreeAds cho phép người dùng xem phim không quảng cáo',
          'info',
          { month3: 'Tiết kiệm ~14%', year1: 'Tiết kiệm ~22%' },
        )}

        {renderTierCard(
          'gold',
          'VIP Gold - Không QC + 1080p + Phim độc quyền',
          'gold',
          'VIP Gold bao gồm: Không quảng cáo + Chất lượng 1080p + Phim độc quyền + Hỗ trợ ưu tiên',
          'warning',
          { month3: 'Tiết kiệm ~12%', year1: 'Tiết kiệm ~20%' },
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
            Lưu bảng giá VIP
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
