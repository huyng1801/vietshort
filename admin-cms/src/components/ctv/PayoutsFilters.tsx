'use client';

import { Input, Select, Button, Space, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';

interface PayoutsFiltersProps {
  search: string;
  status: string;
  dateRange: [Dayjs, Dayjs] | undefined;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | undefined) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function PayoutsFilters({
  search,
  status,
  dateRange,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onSearch,
  onReset,
}: PayoutsFiltersProps): ReactNode {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Tên CTV, ngân hàng, số tài khoản..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 320 }}
        allowClear
      />
      <Select
        placeholder="Trạng thái"
        value={status || undefined}
        onChange={onStatusChange}
        style={{ width: 160 }}
        allowClear
        options={[
          { label: 'Chờ duyệt', value: 'PENDING' },
          { label: 'Đã duyệt', value: 'APPROVED' },
          { label: 'Đang xử lý', value: 'PROCESSING' },
          { label: 'Hoàn thành', value: 'COMPLETED' },
          { label: 'Từ chối', value: 'REJECTED' },
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
