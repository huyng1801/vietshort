'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { BookFilled } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { VideoSocialStats } from '@/types';
import VideoSocialTable from '@/components/social/favorites/VideoSocialTable';
import FavoritesFilters from '@/components/social/favorites/FavoritesFilters';

export default function FavoritesPage() {
  const [videos, setVideos] = useState<VideoSocialStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getFavoriteStats({
        page: params.page,
        limit: params.limit,
        search: search || undefined,
        sortBy: 'favoriteCount',
        sortOrder: 'desc',
      });
      const result = res.data?.data || res.data;
      setVideos(Array.isArray(result) ? result : result?.data || []);
      setTotal(res.data?.pagination?.total || res.data?.total || 0);
    } catch {
      message.error('Không thể tải dữ liệu sưu tầm');
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, search, setTotal]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Video sưu tầm</h1>

      <FavoritesFilters
        search={search}
        onSearchChange={setSearch}
        onSearch={() => setParams((p) => ({ ...p, page: 1 }))}
        onReset={() => { setSearch(''); setParams((p) => ({ ...p, page: 1 })); }}
      />

      <VideoSocialTable
        videos={videos}
        loading={loading}
        pagination={paginationConfig}
        onTableChange={handleTableChange}
        type="favorites"
      />
    </div>
  );
}
