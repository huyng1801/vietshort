'use client';

import { memo } from 'react';
import { Space, Select, Button, Input } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface RatingsFiltersProps {
  search: string;
  filterRating: number | undefined;
  onSearchChange: (value: string) => void;
  onRatingChange: (value: number | undefined) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default memo(function RatingsFilters({
  search,
  filterRating,
  onSearchChange,
  onRatingChange,
  onSearch,
  onReset,
}: RatingsFiltersProps) {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Tìm theo nội dung, người dùng..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 280 }}
        allowClear
      />

      <Select
        placeholder="Lọc theo sao"
        value={filterRating}
        onChange={onRatingChange}
        style={{ width: 160 }}
        allowClear
        options={[5, 4, 3, 2, 1].map((s) => ({ label: `${s} sao`, value: s }))}
      />

      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
});
