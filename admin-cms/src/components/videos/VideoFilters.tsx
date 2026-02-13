'use client';

import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface VideoFiltersProps {
  search: string;
  statusFilter: string;
  genreFilter: string;
  genres: { label: string; value: string }[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onGenreFilterChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function VideoFilters({
  search,
  statusFilter,
  genreFilter,
  genres,
  onSearchChange,
  onStatusFilterChange,
  onGenreFilterChange,
  onSearch,
  onReset,
}: VideoFiltersProps): ReactNode {
  return (
    <Space wrap className="mb-4">
      <Input
        placeholder="Tìm kiếm phim..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onPressEnter={onSearch}
        style={{ width: 250 }}
        allowClear
      />
      <Select
        placeholder="Trạng thái"
        value={statusFilter || undefined}
        onChange={onStatusFilterChange}
        style={{ width: 140 }}
        allowClear
        options={[
          { label: 'Bản nháp', value: 'DRAFT' },
          { label: 'Đã xuất bản', value: 'PUBLISHED' },
          { label: 'Lưu trữ', value: 'ARCHIVED' },
        ]}
      />
      <Select
        placeholder="Thể loại"
        value={genreFilter || undefined}
        onChange={onGenreFilterChange}
        style={{ width: 160 }}
        allowClear
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={genres}
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