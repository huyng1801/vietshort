'use client';

import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'switch' | 'upload' | 'password';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  rules?: Record<string, unknown>[];
  disabled?: boolean;
  span?: number;
}

interface FormBuilderProps {
  fields: FormField[];
  form: ReturnType<typeof Form.useForm>[0];
  onFinish: (values: Record<string, unknown>) => void;
  loading?: boolean;
  layout?: 'horizontal' | 'vertical' | 'inline';
  submitText?: string;
  initialValues?: Record<string, unknown>;
}

export default function FormBuilder({
  fields,
  form,
  onFinish,
  loading,
  layout = 'vertical',
  submitText = 'Lưu',
  initialValues,
}: FormBuilderProps) {
  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return <Input.TextArea placeholder={field.placeholder} rows={4} disabled={field.disabled} />;
      case 'number':
        return (
          <InputNumber
            placeholder={field.placeholder}
            style={{ width: '100%' }}
            disabled={field.disabled}
          />
        );
      case 'select':
        return (
          <Select
            placeholder={field.placeholder}
            options={field.options}
            disabled={field.disabled}
            allowClear
          />
        );
      case 'date':
        return <DatePicker style={{ width: '100%' }} disabled={field.disabled} />;
      case 'switch':
        return <Switch disabled={field.disabled} />;
      case 'upload':
        return (
          <Upload maxCount={1} beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} disabled={field.disabled}>
              Chọn file
            </Button>
          </Upload>
        );
      case 'password':
        return <Input.Password placeholder={field.placeholder} disabled={field.disabled} />;
      default:
        return <Input placeholder={field.placeholder} disabled={field.disabled} />;
    }
  };

  return (
    <Form
      form={form}
      layout={layout}
      onFinish={onFinish}
      initialValues={initialValues}
      autoComplete="off"
    >
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          valuePropName={field.type === 'switch' ? 'checked' : 'value'}
          rules={
            field.rules ||
            (field.required ? [{ required: true, message: `Vui lòng nhập ${field.label}` }] : [])
          }
        >
          {renderField(field)}
        </Form.Item>
      ))}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  );
}
