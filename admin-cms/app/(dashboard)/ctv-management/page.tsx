'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { Dayjs } from 'dayjs';
import type { Affiliate } from '@/types';
import CTVHeader from '@/components/ctv/CTVHeader';
import CTVFilters from '@/components/ctv/CTVFilters';
import CTVTable from '@/components/ctv/CTVTable';

export default function CTVManagementPage() {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | undefined>(undefined);

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, any> = {
        page: params.page,
        limit: params.limit,
        tier: '1', // Admin chỉ quản lý tier 1 (công ty)
      };

      if (search && search.trim()) {
        apiParams.search = search;
      }
      if (isActive !== undefined) {
        apiParams.isActive = isActive;
      }
      if (isVerified !== undefined) {
        apiParams.isVerified = isVerified;
      }
      if (dateRange && dateRange.length === 2) {
        apiParams.dateFrom = dateRange[0].toISOString();
        apiParams.dateTo = dateRange[1].toISOString();
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
  }, [params.page, params.limit, search, isActive, isVerified, dateRange, setTotal]);

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

  const handleReset = () => {
    setSearch('');
    setIsActive(undefined);
    setIsVerified(undefined);
    setDateRange(undefined);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div>
      <CTVHeader
        onRefresh={fetchAffiliates}
        onAdd={() => router.push('/ctv-management/create')}
      />

      <CTVFilters
        search={search}
        isActive={isActive}
        isVerified={isVerified}
        dateRange={dateRange}
        onSearchChange={setSearch}
        onActiveChange={setIsActive}
        onVerifiedChange={setIsVerified}
        onDateRangeChange={setDateRange}
        onSearch={handleSearch}
        onReset={handleReset}
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
