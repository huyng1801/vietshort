'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import { useFilters } from '@/hooks/useFilters';
import type { Affiliate } from '@/types';
import CTVHeader from '@/components/ctv/CTVHeader';
import CTVFilters from '@/components/ctv/CTVFilters';
import CTVTable from '@/components/ctv/CTVTable';

export default function CTVManagementPage() {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  const defaultFilters = {
    search: '',
    isActive: '',
    isVerified: '',
    dateRange: [] as any[],
  };

  const { filters, updateFilter, resetFilters } = useFilters(defaultFilters);

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, any> = {
        page: params.page,
        limit: params.limit,
        tier: '1', // Admin chỉ quản lý tier 1 (công ty)
      };

      if (filters.search && filters.search.trim()) {
        apiParams.search = filters.search;
      }
      if (filters.isActive && filters.isActive !== '') {
        apiParams.isActive = filters.isActive;
      }
      if (filters.isVerified && filters.isVerified !== '') {
        apiParams.isVerified = filters.isVerified;
      }
      if (filters.dateRange && filters.dateRange.length === 2) {
        apiParams.dateFrom = filters.dateRange[0];
        apiParams.dateTo = filters.dateRange[1];
      }

      const res = await adminAPI.getAffiliates(apiParams);

      let list: Affiliate[] = [];
      let totalCount = 0;

      if (res.data) {
        if (res.data.data && Array.isArray(res.data.data)) {
          list = res.data.data;
          totalCount = res.data.meta?.total || list.length;
        } else if (Array.isArray(res.data)) {
          list = res.data;
          totalCount = list.length;
        } else if (res.data.items && Array.isArray(res.data.items)) {
          list = res.data.items;
          totalCount = res.data.total || list.length;
        }
      }

      setAffiliates(list);
      setTotal(totalCount);
    } catch {
      message.error('Không thể tải danh sách CTV');
      setAffiliates([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, filters, setTotal]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  useEffect(() => {
    if (!loading && affiliates.length === 0 && params.page > 1 && total > 0) {
      const timer = setTimeout(() => {
        setParams((prev) => ({ ...prev, page: prev.page - 1 }));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [affiliates.length, loading, params.page, total, setParams]);

  return (
    <div>
      <CTVHeader
        onRefresh={fetchAffiliates}
        onAdd={() => router.push('/ctv-management/create')}
      />

      <CTVFilters
        values={filters}
        onChange={updateFilter as (key: string, value: unknown) => void}
        onReset={resetFilters}
      />

      <CTVTable
        affiliates={affiliates}
        loading={loading}
        pagination={{ ...paginationConfig, total }}
        onChange={handleTableChange}
        onRefresh={fetchAffiliates}
      />
    </div>
  );
}
