'use client';

import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, message, Space, Alert } from 'antd';
import dayjs from 'dayjs';
import adminAPI from '@/lib/admin-api';

interface CodeBatchFormProps {
  onSuccess?: () => void;
}

const REWARD_TYPES = [
  { label: '🪙 Xu vàng (GOLD)', value: 'GOLD' },
  { label: '👑 VIP Days', value: 'VIP_DAYS' },
];

export default function CodeBatchForm({ onSuccess }: CodeBatchFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const rewardType = Form.useWatch('rewardType', form);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const submitData: Record<string, unknown> = {
        batchName: values.batchName,
        quantity: values.quantity,
        rewardType: values.rewardType,
        goldValue: values.rewardType === 'GOLD' ? values.rewardValue : 0,
        vipDays: values.rewardType === 'VIP_DAYS' ? values.rewardValue : 0,
        usageLimit: values.usageLimit || 1,
        codeLength: values.codeLength || 8,
        codePrefix: values.codePrefix || undefined,
        expiresAt: values.expiresAt?.toISOString() || undefined,
      };

      const res = await adminAPI.createCodeBatch(submitData);
      const codesCount = res.data?.codes?.length || values.quantity;
      message.success(`Đã tạo lô mã "${values.batchName}" với ${codesCount} mã thành công!`);
      form.resetFields();
      onSuccess?.();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Tạo lô mã thất bại';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        rewardType: 'GOLD',
        quantity: 10,
        rewardValue: 1000,
        codeLength: 8,
        usageLimit: 1,
      }}
    >
      <Alert
        message="Tạo lô mã hàng loạt"
        description="Hệ thống sẽ tự động sinh mã ngẫu nhiên duy nhất cho lô mã. Bạn có thể xuất Excel sau khi tạo."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="batchName"
        label="Tên lô mã"
        rules={[
          { required: true, message: 'Vui lòng nhập tên lô mã' },
          { min: 3, max: 50, message: 'Tên lô mã từ 3-50 ký tự' },
        ]}
      >
        <Input placeholder="VD: Khuyến mãi Tết 2026" />
      </Form.Item>

      <Form.Item
        name="rewardType"
        label="Loại phần thưởng"
        rules={[{ required: true, message: 'Chọn loại phần thưởng' }]}
      >
        <Select options={REWARD_TYPES} />
      </Form.Item>

      <Form.Item
        name="rewardValue"
        label={rewardType === 'VIP_DAYS' ? 'Số ngày VIP / mã' : 'Số xu vàng / mã'}
        rules={[
          { required: true, message: 'Vui lòng nhập giá trị' },
          { type: 'number', min: 1, message: 'Giá trị phải lớn hơn 0' },
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
        name="quantity"
        label="Số lượng mã cần tạo"
        rules={[
          { required: true, message: 'Vui lòng nhập số lượng' },
          { type: 'number', min: 1, max: 1000, message: 'Từ 1 đến 1000 mã' },
        ]}
      >
        <InputNumber min={1} max={1000} style={{ width: '100%' }} />
      </Form.Item>

      <Space style={{ width: '100%' }} size="middle">
        <Form.Item
          name="codePrefix"
          label="Prefix mã (tùy chọn)"
          tooltip="VD: TET → mã sẽ là TET_XXXXXX"
          style={{ flex: 1 }}
        >
          <Input
            placeholder="VD: TET"
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => form.setFieldValue('codePrefix', e.target.value.toUpperCase())}
          />
        </Form.Item>

        <Form.Item
          name="codeLength"
          label="Độ dài mã"
          tooltip="Tổng ký tự của mã (bao gồm prefix)"
          style={{ flex: 1 }}
        >
          <InputNumber min={6} max={20} style={{ width: '100%' }} />
        </Form.Item>
      </Space>

      <Form.Item
        name="usageLimit"
        label="Giới hạn sử dụng / mã"
        tooltip="Mỗi mã có thể được dùng bao nhiêu lần"
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="expiresAt"
        label="Ngày hết hạn (tùy chọn)"
        tooltip="Để trống nếu mã không có thời hạn"
      >
        <DatePicker
          showTime={{ format: 'HH:mm' }}
          format="DD/MM/YYYY HH:mm"
          placeholder="Chọn ngày hết hạn"
          style={{ width: '100%' }}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
        />
      </Form.Item>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Tạo lô mã
        </Button>
      </Form.Item>
    </Form>
  );
}
