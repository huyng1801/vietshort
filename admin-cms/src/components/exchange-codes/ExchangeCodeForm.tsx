'use client';

import React, { useEffect } from 'react';
import { Form, Input, Button, Space, Select, InputNumber, DatePicker, Card, message } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import adminAPI from '@/lib/admin-api';
import type { ExchangeCode } from '@/types';

interface ExchangeCodeFormProps {
  code?: ExchangeCode | null;
  onSuccess?: () => void;
  loading?: boolean;
}

const REWARD_TYPES = [
  { label: '🪙 Xu vàng', value: 'GOLD' },
  { label: '👑 VIP Days', value: 'VIP_DAYS' },
];

export default function ExchangeCodeForm({
  code,
  onSuccess,
  loading = false,
}: ExchangeCodeFormProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = !!code;

  useEffect(() => {
    if (code) {
      form.setFieldsValue({
        code: code.code,
        batchName: code.batchName,
        rewardType: code.rewardType,
        rewardValue: code.rewardValue,
        usageLimit: code.usageLimit,
        expiresAt: code.expiresAt ? dayjs(code.expiresAt) : null,
        isActive: code.isActive,
      });
    } else {
      form.setFieldsValue({
        rewardType: 'GOLD',
        rewardValue: 1000,
        usageLimit: 1,
        isActive: true,
      });
    }
  }, [code, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const submitData = {
        code: values.code,
        batchName: values.batchName || '',
        rewardType: values.rewardType,
        rewardValue: values.rewardValue,
        maxUses: values.usageLimit,
        expiresAt: values.expiresAt?.toISOString() || null,
      };

      if (isEdit) {
        // Note: Update endpoint not available in backend, 
        // this would need to be added to the backend controller
        message.warning('Chức năng chỉnh sửa chưa được hỗ trợ');
      } else {
        await adminAPI.createExchangeCode(submitData);
        message.success('✓ Đã tạo mã đổi quà thành công!');
        onSuccess?.();
        form.resetFields();
      }
    } catch (err: any) {
      console.error('Exchange code save error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể lưu mã đổi quà';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const rewardType = Form.useWatch('rewardType', form);

  return (
    <Card loading={loading}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item 
          label="Mã" 
          name="code" 
          rules={[
            { required: true, message: 'Vui lòng nhập mã' },
            { min: 6, max: 20, message: 'Mã phải từ 6-20 ký tự' },
            { pattern: /^[A-Z0-9]+$/, message: 'Mã chỉ chứa chữ cái in hoa và số' }
          ]}
          tooltip="Mã sẽ được chuyển thành chữ in hoa tự động"
        >
          <Input 
            placeholder="VD: WELCOME2024" 
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              form.setFieldValue('code', value);
            }}
          />
        </Form.Item>

        <Form.Item 
          label="Tên nhóm/batch" 
          name="batchName"
          tooltip="Tùy chọn: Tên nhóm để quản lý mã"
        >
          <Input placeholder="VD: Khuyến mãi tháng 1" />
        </Form.Item>

        <Form.Item 
          label="Loại phần thưởng" 
          name="rewardType" 
          rules={[{ required: true, message: 'Chọn loại phần thưởng' }]}
        >
          <Select placeholder="Chọn loại phần thưởng" options={REWARD_TYPES} />
        </Form.Item>

        <Form.Item 
          label={rewardType === 'VIP_DAYS' ? 'Số ngày VIP' : 'Số xu vàng'} 
          name="rewardValue" 
          rules={[
            { required: true, message: 'Vui lòng nhập giá trị' },
            { type: 'number', min: 1, message: 'Giá trị phải lớn hơn 0' }
          ]}
        >
          <InputNumber 
            min={1}
            placeholder={rewardType === 'VIP_DAYS' ? '7' : '1000'}
            style={{ width: '100%' }}
            formatter={(value) => 
              rewardType === 'GOLD' 
                ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : `${value}`
            }
            parser={(value) => Number(value!.replace(/,/g, '')) as unknown as 1}
          />
        </Form.Item>

        <Form.Item 
          label="Giới hạn sử dụng" 
          name="usageLimit" 
          rules={[
            { required: true, message: 'Vui lòng nhập giới hạn' },
            { type: 'number', min: 1, message: 'Tối thiểu 1 lần sử dụng' }
          ]}
          tooltip="Số lần tối đa mã này có thể được sử dụng"
        >
          <InputNumber 
            min={1}
            placeholder="1"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item 
          label="Ngày hết hạn" 
          name="expiresAt"
          tooltip="Để trống nếu mã không có thời hạn"
        >
          <DatePicker 
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
            placeholder="Chọn ngày hết hạn"
            style={{ width: '100%' }}
            disabledDate={(current) => {
              // Không cho phép chọn ngày trong quá khứ
              return current && current < dayjs().startOf('day');
            }}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              disabled={loading}
            >
              {isEdit ? 'Cập nhật' : 'Tạo mã'}
            </Button>
            <Button onClick={() => router.back()}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}