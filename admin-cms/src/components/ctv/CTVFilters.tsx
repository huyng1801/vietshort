'use client';

import React from 'react';
import FilterBar, { FilterField } from '@/components/common/FilterBar';

interface CTVFiltersProps {
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
    placeholder: 'Email, biệt danh, tên, mã CTV, SĐT, công ty...',
    width: 300,
  },

  {
    key: 'isActive',
    label: 'Trạng thái',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Hoạt động', value: 'true' },
      { label: 'Không hoạt động', value: 'false' },
    ],
  },
  {
    key: 'isVerified',
    label: 'Xác thực',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Đã xác thực', value: 'true' },
      { label: 'Chưa xác thực', value: 'false' },
    ],
  },
  {
    key: 'dateRange',
    label: 'Ngày tạo',
    type: 'dateRange',
  },
];

export default function CTVFilters({ values, onChange, onReset, onSearch }: CTVFiltersProps) {
  return <FilterBar fields={filterFields} values={values} onChange={onChange} onReset={onReset} onSearch={onSearch} />;
}
