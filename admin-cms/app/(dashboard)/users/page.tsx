'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { User } from '@/types';
import UsersHeader from '@/components/users/UsersHeader';
import UserFilters from '@/components/users/UserFilters';
import UserTable from '@/components/users/UserTable';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });
  
  // Filter state
  const [search, setSearch] = useState('');
  const [vipTier, setVipTier] = useState('');
  const [isLocked, setIsLocked] = useState('');
  const [isActive, setIsActive] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState('');
  const [registrationSource, setRegistrationSource] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | undefined>();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare filter values
      const apiParams: Record<string, any> = {
        page: params.page,
        limit: params.limit,
      };

      // Only include filters with values
      if (search && search.trim()) {
        apiParams.search = search;
      }
      if (vipTier && vipTier !== '') {
        apiParams.vipTier = vipTier === 'null' ? null : vipTier;
      }
      if (isLocked && isLocked !== '') {
        apiParams.isLocked = isLocked === 'true';
      }
      if (isActive && isActive !== '') {
        apiParams.isActive = isActive === 'true';
      }
      if (isEmailVerified && isEmailVerified !== '') {
        apiParams.isEmailVerified = isEmailVerified === 'true';
      }
      if (registrationSource && registrationSource !== '') {
        apiParams.registrationSource = registrationSource;
      }
      if (dateRange && dateRange.length === 2) {
        apiParams.dateFrom = dateRange[0].format('YYYY-MM-DD');
        apiParams.dateTo = dateRange[1].format('YYYY-MM-DD');
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
  }, [params.page, params.limit, search, vipTier, isLocked, isActive, isEmailVerified, registrationSource, dateRange, setTotal]);

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
        search={search}
        vipTier={vipTier}
        isLocked={isLocked}
        isActive={isActive}
        isEmailVerified={isEmailVerified}
        registrationSource={registrationSource}
        dateRange={dateRange}
        onSearchChange={setSearch}
        onVipTierChange={setVipTier}
        onLockedChange={setIsLocked}
        onActiveChange={setIsActive}
        onEmailVerifiedChange={setIsEmailVerified}
        onRegistrationSourceChange={setRegistrationSource}
        onDateRangeChange={setDateRange}
        onSearch={fetchUsers}
        onReset={() => {
          setSearch('');
          setVipTier('');
          setIsLocked('');
          setIsActive('');
          setIsEmailVerified('');
          setRegistrationSource('');
          setDateRange(undefined);
        }}
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
