'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { VideoSocialStats } from '@/types';
import VideoSocialTable from '@/components/social/favorites/VideoSocialTable';
import LikesFilters from '@/components/social/likes/LikesFilters';

export default function LikesPage() {
  const [videos, setVideos] = useState<VideoSocialStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getLikeStats({
        page: params.page,
        limit: params.limit,
        search: search || undefined,
        sortBy: 'likeCount',
        sortOrder: 'desc',
      });
      const result = res.data?.data || res.data;
      setVideos(Array.isArray(result) ? result : result?.data || []);
      setTotal(res.data?.pagination?.total || res.data?.total || 0);
    } catch {
      message.error('Không thể tải dữ liệu yêu thích');
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, search, setTotal]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Yêu thích (Tim)</h1>

      <LikesFilters
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
        type="likes"
      />
    </div>
  );
}
