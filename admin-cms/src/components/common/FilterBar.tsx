'use client';

import React from 'react';
import { Space, Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

export interface FilterField {
  key: string;
  label: string;
  type: 'search' | 'select' | 'dateRange';
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  width?: number;
}

interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset: () => void;
  onSearch?: () => void;
}

export default function FilterBar({ fields, values, onChange, onReset, onSearch }: FilterBarProps) {
  return (
    <Space wrap className="mb-4">
      {fields.map((field) => {
        switch (field.type) {
          case 'search':
            return (
              <Input
                key={field.key}
                placeholder={field.placeholder || `Tìm ${field.label}`}
                prefix={<SearchOutlined />}
                value={values[field.key] as string}
                onChange={(e) => onChange(field.key, e.target.value)}
                onPressEnter={onSearch}
                style={{ width: field.width || 280 }}
                allowClear
              />
            );
          case 'select':
            return (
              <Select
                key={field.key}
                placeholder={field.placeholder || field.label}
                value={values[field.key] as string}
                onChange={(v) => onChange(field.key, v)}
                options={field.options}
                style={{ width: field.width || 160 }}
                allowClear
              />
            );
          case 'dateRange':
            return (
              <RangePicker
                key={field.key}
                onChange={(dates) => onChange(field.key, dates)}
                style={{ width: field.width || 280 }}
              />
            );
          default:
            return null;
        }
      })}
      {onSearch && (
        <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
          Tìm kiếm
        </Button>
      )}
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
}
