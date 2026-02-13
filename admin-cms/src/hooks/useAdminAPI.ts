'use client';

import { useState, useCallback } from 'react';
import { message } from 'antd';
import adminAPI from '@/lib/admin-api';

type ApiMethod = (...args: unknown[]) => Promise<unknown>;

export function useAdminAPI<T>(apiFn: ApiMethod) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFn(...args);
        const result = (res as { data: { data: T } }).data?.data ?? (res as { data: T }).data;
        setData(result as T);
        return result as T;
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Có lỗi xảy ra';
        setError(errorMessage);
        message.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn],
  );

  return { data, loading, error, execute };
}

export { adminAPI };
