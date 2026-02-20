'use client';

import { Input, Select, Button, Space, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';

interface CTVFiltersProps {
  search: string;
  isActive: boolean | undefined;
  isVerified: boolean | undefined;
  dateRange: [Dayjs, Dayjs] | undefined;
  onSearchChange: (value: string) => void;
  onActiveChange: (value: boolean | undefined) => void;
  onVerifiedChange: (value: boolean | undefined) => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | undefined) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function CTVFilters({
  search,
  isActive,
  isVerified,
  dateRange,
  onSearchChange,
  onActiveChange,
  onVerifiedChange,
  onDateRangeChange,
  onSearch,
  onReset,
}: CTVFiltersProps): ReactNode {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Email, biệt danh, tên, mã CTV, SĐT, công ty..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 320 }}
        allowClear
      />
      <Select
        placeholder="Trạng thái"
        value={isActive}
        onChange={onActiveChange}
        style={{ width: 160 }}
        allowClear
        options={[
          { label: 'Hoạt động', value: true },
          { label: 'Không hoạt động', value: false },
        ]}
      />
      <Select
        placeholder="Xác thực"
        value={isVerified}
        onChange={onVerifiedChange}
        style={{ width: 160 }}
        allowClear
        options={[
          { label: 'Đã xác thực', value: true },
          { label: 'Chưa xác thực', value: false },
        ]}
      />
      <DatePicker.RangePicker
        value={dateRange}
        onChange={(dates) => onDateRangeChange(dates as [Dayjs, Dayjs] | undefined)}
        style={{ width: 280 }}
      />
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
}
