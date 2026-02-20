'use client';

import { Input, Select, Button, Space, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

const { RangePicker } = DatePicker;

interface CodeBatchFiltersProps {
  search: string;
  isActive: string | undefined;
  rewardType: string | undefined;
  dateRange: [Dayjs, Dayjs] | null;
  onSearchChange: (value: string) => void;
  onIsActiveChange: (value: string | undefined) => void;
  onRewardTypeChange: (value: string | undefined) => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function CodeBatchFilters({
  search,
  isActive,
  rewardType,
  dateRange,
  onSearchChange,
  onIsActiveChange,
  onRewardTypeChange,
  onDateRangeChange,
  onSearch,
  onReset,
}: CodeBatchFiltersProps): ReactNode {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Tên lô mã, prefix..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 250 }}
        allowClear
      />
      <Select
        placeholder="Trạng thái"
        value={isActive}
        onChange={onIsActiveChange}
        style={{ width: 160 }}
        allowClear
        options={[
          { label: 'Hoạt động', value: 'true' },
          { label: 'Đã vô hiệu hóa', value: 'false' },
        ]}
      />
      <Select
        placeholder="Loại phần thưởng"
        value={rewardType}
        onChange={onRewardTypeChange}
        style={{ width: 170 }}
        allowClear
        options={[
          { label: '🪙 Xu vàng', value: 'GOLD' },
          { label: '👑 VIP Days', value: 'VIP_DAYS' },
        ]}
      />
      <RangePicker
        value={dateRange}
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            onDateRangeChange([dates[0], dates[1]]);
          } else {
            onDateRangeChange(null);
          }
        }}
        style={{ width: 280 }}
      />

      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
}
