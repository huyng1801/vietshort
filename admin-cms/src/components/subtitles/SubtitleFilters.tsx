'use client';

import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface SubtitleFiltersProps {
  search: string;
  subtitleStatusFilter: string;
  videoTypeFilter: string;
  statusFilter: string;
  genreFilter: string;
  genres: { label: string; value: string }[];
  onSearchChange: (value: string) => void;
  onSubtitleStatusFilterChange: (value: string) => void;
  onVideoTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onGenreFilterChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function SubtitleFilters({
  search,
  subtitleStatusFilter,
  videoTypeFilter,
  statusFilter,
  genreFilter,
  genres,
  onSearchChange,
  onSubtitleStatusFilterChange,
  onVideoTypeFilterChange,
  onStatusFilterChange,
  onGenreFilterChange,
  onSearch,
  onReset,
}: SubtitleFiltersProps): ReactNode {
  return (
    <Space wrap className="mb-4">
        <Input
          placeholder="Tìm kiếm video..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onPressEnter={onSearch}
          style={{ width: 280 }}
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
        <Select
          placeholder="Loại video"
          value={videoTypeFilter || undefined}
          onChange={onVideoTypeFilterChange}
          style={{ width: 140 }}
          allowClear
          options={[
            { label: '📺 Phim bộ', value: 'SERIAL' },
            { label: '🎬 Phim lẻ', value: 'MOVIE' },
          ]}
        />
        <Select
          placeholder="Trạng thái phụ đề"
          value={subtitleStatusFilter || undefined}
          onChange={onSubtitleStatusFilterChange}
          style={{ width: 160 }}
          allowClear
          options={[
            { label: '✅ Đã hoàn thành', value: 'COMPLETED' },
            { label: '⏳ Đang xử lý', value: 'PROCESSING' },
            { label: '❌ Có lỗi', value: 'FAILED' },
            { label: '📝 Chưa có phụ đề', value: 'NONE' },
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
