'use client';

import React from 'react';
import FilterBar, { FilterField } from '@/components/common/FilterBar';

interface UserFiltersProps {
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset: () => void;
  onSearch?: () => void;
}

const filterFields: FilterField[] = [
  { 
    key: 'search', 
    label: 'Tìm kiếm', 
    type: 'search', 
    placeholder: 'Email, biệt danh, số điện thoại...', 
    width: 300 
  },
  {
    key: 'vipTier',
    label: 'Loại VIP',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Thường', value: 'null' },
      { label: 'VIP Gold', value: 'VIP_GOLD' },
    ],
  },
  {
    key: 'isLocked',
    label: 'Trạng thái khóa',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Đang khóa', value: 'true' },
      { label: 'Không khóa', value: 'false' },
    ],
  },
  {
    key: 'isActive',
    label: 'Trạng thái hoạt động',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Hoạt động', value: 'true' },
      { label: 'Không hoạt động', value: 'false' },
    ],
  },
  {
    key: 'isEmailVerified',
    label: 'Xác thực email',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Đã xác thực', value: 'true' },
      { label: 'Chưa xác thực', value: 'false' },
    ],
  },
  {
    key: 'registrationSource',
    label: 'Nguồn đăng ký',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Web', value: 'web' },
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' },
      { label: 'Guest', value: 'guest' },
    ],
  },
  { 
    key: 'dateRange', 
    label: 'Ngày đăng ký', 
    type: 'dateRange' 
  },
];

export default function UserFilters({ values, onChange, onReset, onSearch }: UserFiltersProps) {
  return <FilterBar fields={filterFields} values={values} onChange={onChange} onReset={onReset} onSearch={onSearch} />;
}
