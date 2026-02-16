'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import { useFilters } from '@/hooks/useFilters';
import type { User } from '@/types';
import UsersHeader from '@/components/users/UsersHeader';
import UserFilters from '@/components/users/UserFilters';
import UserTable from '@/components/users/UserTable';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });
  
  const defaultFilters = {
    search: '',
    vipTier: '',
    isLocked: '',
    isActive: '',
    isEmailVerified: '',
    registrationSource: '',
    dateRange: [] as any[],
  };
  
  const { filters, updateFilter, resetFilters } = useFilters(defaultFilters);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare filter values
      const apiParams: Record<string, any> = {
        page: params.page,
        limit: params.limit,
      };

      // Only include filters with values
      if (filters.search && filters.search.trim()) {
        apiParams.search = filters.search;
      }
      if (filters.vipTier && filters.vipTier !== '') {
        apiParams.vipTier = filters.vipTier === 'null' ? null : filters.vipTier;
      }
      if (filters.isLocked && filters.isLocked !== '') {
        apiParams.isLocked = filters.isLocked === 'true';
      }
      if (filters.isActive && filters.isActive !== '') {
        apiParams.isActive = filters.isActive === 'true';
      }
      if (filters.isEmailVerified && filters.isEmailVerified !== '') {
        apiParams.isEmailVerified = filters.isEmailVerified === 'true';
      }
      if (filters.registrationSource && filters.registrationSource !== '') {
        apiParams.registrationSource = filters.registrationSource;
      }
      if (filters.dateRange && filters.dateRange.length === 2) {
        apiParams.dateFrom = filters.dateRange[0];
        apiParams.dateTo = filters.dateRange[1];
      }

      const res = await adminAPI.getUsers(apiParams);

      let list: User[] = [];
      let totalCount = 0;

      if (res.data) {
        if (res.data.data && Array.isArray(res.data.data)) {
          list = res.data.data;
          totalCount = res.data.pagination?.total || res.data.meta?.total || list.length;
        } else if (Array.isArray(res.data)) {
          list = res.data;
          totalCount = list.length;
        } else if (res.data.items && Array.isArray(res.data.items)) {
          list = res.data.items;
          totalCount = res.data.total || list.length;
        }
      }

      setUsers(list);
      setTotal(totalCount);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách người dùng');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, filters, setTotal]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle pagination when page becomes empty
  useEffect(() => {
    if (!loading && users.length === 0 && params.page > 1 && total > 0) {
      const timer = setTimeout(() => {
        setParams((prev) => ({ ...prev, page: prev.page - 1 }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [users.length, params.page, total, loading, setParams]);

  return (
    <div>
      <UsersHeader onRefresh={fetchUsers} />
      
      <UserFilters 
        values={filters}
        onChange={updateFilter}
        onReset={resetFilters}
        onSearch={fetchUsers}
      />

      <UserTable
        users={users}
        loading={loading}
        pagination={{ ...paginationConfig, total }}
        onChange={handleTableChange}
        onRefresh={fetchUsers}
      />
    </div>
  );
}
