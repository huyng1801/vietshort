'use client';

import { memo } from 'react';
import { Space, Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface CommentsFiltersProps {
  search: string;
  filterApproved: string | undefined;
  filterReported: string | undefined;
  onSearchChange: (value: string) => void;
  onApprovedChange: (value: string | undefined) => void;
  onReportedChange: (value: string | undefined) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default memo(function CommentsFilters({
  search,
  filterApproved,
  filterReported,
  onSearchChange,
  onApprovedChange,
  onReportedChange,
  onSearch,
  onReset,
}: CommentsFiltersProps) {
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
        placeholder="Trạng thái duyệt"
        value={filterApproved}
        onChange={onApprovedChange}
        style={{ width: 160 }}
        allowClear
        options={[
          { label: 'Đã duyệt', value: 'true' },
          { label: 'Chờ duyệt', value: 'false' },
        ]}
      />
      <Select
        placeholder="Báo cáo"
        value={filterReported}
        onChange={onReportedChange}
        style={{ width: 160 }}
        allowClear
        options={[
          { label: 'Bị báo cáo', value: 'true' },
          { label: 'Bình thường', value: 'false' },
        ]}
      />

      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại
      </Button>
    </Space>
  );
});
