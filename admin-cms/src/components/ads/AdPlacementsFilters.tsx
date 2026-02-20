'use client';

import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { AdPlacementType, AdStatus } from '@/types';

interface AdPlacementsFiltersProps {
  search: string;
  filterType: AdPlacementType | undefined;
  filterStatus: AdStatus | undefined;
  filterActive: boolean | undefined;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: AdPlacementType | undefined) => void;
  onStatusChange: (value: AdStatus | undefined) => void;
  onActiveChange: (value: boolean | undefined) => void;
  onSearch: () => void;
  onReset: () => void;
}

const AD_TYPES = [
  { label: 'Banner', value: 'BANNER' },
  { label: 'Interstitial', value: 'INTERSTITIAL' },
  { label: 'Reward Video', value: 'REWARD_VIDEO' },
  { label: 'Native', value: 'NATIVE' },
];

const AD_STATUSES = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Tạm dừng', value: 'PAUSED' },
  { label: 'Lưu trữ', value: 'ARCHIVED' },
];

export default function AdPlacementsFilters({
  search,
  filterType,
  filterStatus,
  filterActive,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onActiveChange,
  onSearch,
  onReset,
}: AdPlacementsFiltersProps): ReactNode {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Tìm vị trí quảng cáo..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 240 }}
        allowClear
      />
      <Select
        placeholder="Loại QC"
        value={filterType}
        onChange={onTypeChange}
        style={{ width: 160 }}
        allowClear
        options={AD_TYPES}
      />
      <Select
        placeholder="Trạng thái"
        value={filterStatus}
        onChange={onStatusChange}
        style={{ width: 150 }}
        allowClear
        options={AD_STATUSES}
      />
      <Select
        placeholder="Bật/tắt"
        value={filterActive}
        onChange={onActiveChange}
        style={{ width: 130 }}
        allowClear
        options={[
          { label: 'Đang bật', value: true },
          { label: 'Đã tắt', value: false },
        ]}
      />
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
}
