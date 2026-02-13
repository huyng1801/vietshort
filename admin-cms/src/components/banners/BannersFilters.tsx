'use client';

import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface BannersFiltersProps {
  search: string;
  filterActive: boolean | undefined;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: boolean | undefined) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function BannersFilters({
  search,
  filterActive,
  onSearchChange,
  onFilterChange,
  onSearch,
  onReset,
}: BannersFiltersProps): ReactNode {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Tìm banner..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 280 }}
        allowClear
      />
      <Select
        placeholder="Trạng thái"
        value={filterActive}
        onChange={onFilterChange}
        style={{ width: 150 }}
        allowClear
        options={[
          { label: 'Hoạt động', value: true },
          { label: 'Đã ẩn', value: false },
        ]}
      />
      <Button icon={<SearchOutlined />} type="primary" onClick={onSearch}>
        Tìm kiếm
      </Button>
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
}