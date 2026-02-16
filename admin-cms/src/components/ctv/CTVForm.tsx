'use client';

import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, message, Row, Col, Tag, Typography, DatePicker } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import { Affiliate, AffiliateType } from '@/types';

const TIER_COLORS: Record<number, string> = { 1: 'purple', 2: 'blue', 3: 'green' };
const TIER_LABELS: Record<number, string> = { 1: 'Cấp 1 - Công ty', 2: 'Cấp 2 - CTV', 3: 'Cấp 3 - CTV phụ' };

interface CTVFormProps {
  affiliate?: Affiliate;
  onSuccess?: () => void;
}

export default function CTVForm({ affiliate, onSuccess }: CTVFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEdit = !!affiliate;

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (isEdit) {
        const updateData: Record<string, unknown> = {};
        const editableFields = ['realName', 'companyName', 'phone', 'bankAccount', 'bankName', 'commissionRate', 'isActive', 'isVerified', 'contractNotes', 'contractStartAt', 'contractEndAt'];
        editableFields.forEach((key) => {
          if (values[key] !== undefined) updateData[key] = values[key];
        });
        // Convert DatePicker values to ISO strings
        if (updateData.contractStartAt) updateData.contractStartAt = (updateData.contractStartAt as any).toISOString();
        if (updateData.contractEndAt) updateData.contractEndAt = (updateData.contractEndAt as any).toISOString();
        await adminAPI.updateAffiliate(affiliate.id, updateData);
        message.success('Cập nhật CTV thành công');
      } else {
        const createData = { ...values };
        if (createData.contractStartAt) createData.contractStartAt = (createData.contractStartAt as any).toISOString();
        if (createData.contractEndAt) createData.contractEndAt = (createData.contractEndAt as any).toISOString();
        // Admin chỉ tạo tier 1 - công ty
        createData.affiliateType = 'COMPANY';
        await adminAPI.createAffiliate(createData);
        message.success('Tạo CTV thành công');
      }
      onSuccess?.();
      router.push('/ctv-management');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const initialValues = isEdit
    ? {
        ...affiliate,
        commissionRate: affiliate.commissionRate * 100,
      }
    : {
        commissionRate: 30, // Tier 1 mặc định 30%
        isActive: true,
        isVerified: false,
      };

  return (
    <Card
      title={
        isEdit
          ? 'Chỉnh sửa CTV'
          : (
              <div className="flex items-center gap-2">
                <span>Thêm CTV mới</span>
                <Tag color="purple" icon={<BankOutlined />}>Cấp 1 - Công ty</Tag>
              </div>
            )
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          const data = { ...values, commissionRate: (values.commissionRate as number) / 100 };
          handleSubmit(data);
        }}
        initialValues={initialValues}
      >
        {/* Admin chỉ tạo tier 1 - không có parent selection */}

        {/* Tier info for existing */}
        {isEdit && (
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary">Cấp bậc</Typography.Text>
                <div><Tag color={TIER_COLORS[affiliate.tier ?? 1]}>{TIER_LABELS[affiliate.tier ?? 1]}</Tag></div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary">Loại</Typography.Text>
                <div>
                  <Tag color={affiliate.affiliateType === 'COMPANY' ? 'purple' : 'blue'}>
                    {affiliate.affiliateType === 'COMPANY' ? 'Công ty' : 'Cá nhân'}
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="realName" label="Tên thật" rules={[{ required: true, message: 'Nhập tên thật' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="companyName" label="Công ty">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {!isEdit && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nickname" label="Biệt danh" rules={[{ required: true, message: 'Nhập biệt danh' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        )}

        {!isEdit && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Điện thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        )}

        {isEdit && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Điện thoại">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="commissionRate" label="Tỷ lệ hoa hồng (%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {!isEdit && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="commissionRate" label="Tỷ lệ hoa hồng (%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="bankName" label="Ngân hàng">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bankAccount" label="Số tài khoản">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Contract fields (Tier 1) */}
        <Typography.Title level={5} style={{ marginTop: 16 }}>Thông tin hợp đồng</Typography.Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="contractStartAt" label="Ngày bắt đầu HĐ">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="contractEndAt" label="Ngày kết thúc HĐ">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="contractNotes" label="Ghi chú hợp đồng">
              <Input.TextArea rows={3} placeholder="Nội dung hợp đồng, điều khoản..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </Col>
          {isEdit && (
            <Col span={6}>
              <Form.Item name="isVerified" label="Xác thực" valuePropName="checked">
                <Switch checkedChildren="Đã xác thực" unCheckedChildren="Chưa" />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Cập nhật' : 'Tạo CTV'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => router.push('/ctv-management')}>
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
