'use client';

import { Input, Select, Button, Space, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';

interface UserFiltersProps {
  search: string;
  vipTier: string;
  isLocked: string;
  isActive: string;
  isEmailVerified: string;
  registrationSource: string;
  dateRange: [Dayjs, Dayjs] | undefined;
  onSearchChange: (value: string) => void;
  onVipTierChange: (value: string) => void;
  onLockedChange: (value: string) => void;
  onActiveChange: (value: string) => void;
  onEmailVerifiedChange: (value: string) => void;
  onRegistrationSourceChange: (value: string) => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | undefined) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function UserFilters({
  search,
  vipTier,
  isLocked,
  isActive,
  isEmailVerified,
  registrationSource,
  dateRange,
  onSearchChange,
  onVipTierChange,
  onLockedChange,
  onActiveChange,
  onEmailVerifiedChange,
  onRegistrationSourceChange,
  onDateRangeChange,
  onSearch,
  onReset,
}: UserFiltersProps): ReactNode {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Email, biệt danh, số điện thoại..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 280 }}
        allowClear
      />
      <Select
        placeholder="Loại VIP"
        value={vipTier || undefined}
        onChange={onVipTierChange}
        style={{ width: 140 }}
        allowClear
        options={[
          { label: 'Thường', value: 'null' },
          { label: 'VIP Gold', value: 'VIP_GOLD' },
        ]}
      />
      <Select
        placeholder="Trạng thái khóa"
        value={isLocked || undefined}
        onChange={onLockedChange}
        style={{ width: 140 }}
        allowClear
        options={[
          { label: 'Đang khóa', value: 'true' },
          { label: 'Không khóa', value: 'false' },
        ]}
      />
      <Select
        placeholder="Hoạt động"
        value={isActive || undefined}
        onChange={onActiveChange}
        style={{ width: 140 }}
        allowClear
        options={[
          { label: 'Hoạt động', value: 'true' },
          { label: 'Không hoạt động', value: 'false' },
        ]}
      />
      <Select
        placeholder="Xác thực email"
        value={isEmailVerified || undefined}
        onChange={onEmailVerifiedChange}
        style={{ width: 140 }}
        allowClear
        options={[
          { label: 'Đã xác thực', value: 'true' },
          { label: 'Chưa xác thực', value: 'false' },
        ]}
      />
      <Select
        placeholder="Nguồn đăng ký"
        value={registrationSource || undefined}
        onChange={onRegistrationSourceChange}
        style={{ width: 140 }}
        allowClear
        options={[
          { label: 'Web', value: 'web' },
          { label: 'Android', value: 'android' },
          { label: 'iOS', value: 'ios' },
          { label: 'Guest', value: 'guest' },
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
