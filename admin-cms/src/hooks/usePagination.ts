'use client';

import { useState, useCallback } from 'react';
import { TableParams } from '@/types/admin';

interface UsePaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export function usePagination(options?: UsePaginationOptions) {
  const [params, setParams] = useState<TableParams>({
    page: options?.defaultPage || 1,
    limit: options?.defaultLimit || 20,
    sortBy: options?.defaultSortBy,
    sortOrder: options?.defaultSortOrder || 'desc',
  });

  const [total, setTotal] = useState(0);

  const handleTableChange = useCallback(
    (pagination: { current?: number; pageSize?: number }, _filters: unknown, sorter: unknown) => {
      const s = sorter as { field?: string; order?: string };
      setParams((prev) => ({
        ...prev,
        page: pagination.current || 1,
        limit: pagination.pageSize || prev.limit,
        sortBy: s.field || prev.sortBy,
        sortOrder: s.order === 'ascend' ? 'asc' : 'desc',
      }));
    },
    [],
  );

  const handleSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const paginationConfig = {
    current: params.page,
    pageSize: params.limit,
    total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (t: number) => `Tổng ${t} mục`,
    pageSizeOptions: ['10', '20', '50', '100'],
  };

  return {
    params,
    setParams,
    total,
    setTotal,
    handleTableChange,
    handleSearch,
    paginationConfig,
  };
}
