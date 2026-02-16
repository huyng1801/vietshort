'use client';

import { memo } from 'react';
import { Space, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface RatingsFiltersProps {
  filterRating: number | undefined;
  onRatingChange: (value: number | undefined) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default memo(function RatingsFilters({
  filterRating,
  onRatingChange,
  onSearch,
  onReset,
}: RatingsFiltersProps) {
  return (
    <Space wrap className="mb-4">
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
