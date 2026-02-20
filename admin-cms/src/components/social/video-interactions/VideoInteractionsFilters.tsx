'use client';

import { memo } from 'react';
import { Space, Input, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface VideoInteractionsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default memo(function VideoInteractionsFilters({
  search,
  onSearchChange,
  onSearch,
  onReset,
}: VideoInteractionsFiltersProps) {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Tìm theo tên video..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 280 }}
        allowClear
      />

      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
});
