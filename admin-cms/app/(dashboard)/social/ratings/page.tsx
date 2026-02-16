'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { RatingItem, RatingStats } from '@/types';
import RatingsHeader from '@/components/social/ratings/RatingsHeader';
import RatingsFilters from '@/components/social/ratings/RatingsFilters';
import RatingsTable from '@/components/social/ratings/RatingsTable';

export default function RatingsPage() {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);

  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getRatings({
        page: params.page,
        limit: params.limit,
        rating: filterRating,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const result = res.data?.data || res.data;
      setRatings(Array.isArray(result) ? result : result?.data || []);
      setTotal(res.data?.pagination?.total || res.data?.total || 0);
    } catch {
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, filterRating, setTotal]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getRatingStats();
      setStats(res.data?.data || res.data);
    } catch {
      // ignore
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteRating(id);
      message.success('Đã xóa đánh giá');
      fetchRatings();
      fetchStats();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  useEffect(() => { fetchRatings(); }, [fetchRatings]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý đánh giá</h1>

      <RatingsHeader stats={stats} loading={loading} />

      <RatingsFilters
        filterRating={filterRating}
        onRatingChange={(v) => { setFilterRating(v); setParams((p) => ({ ...p, page: 1 })); }}
        onSearch={() => { fetchRatings(); fetchStats(); }}
        onReset={() => { setFilterRating(undefined); setParams((p) => ({ ...p, page: 1 })); }}
      />

      <RatingsTable
        ratings={ratings}
        loading={loading}
        pagination={paginationConfig}
        onTableChange={handleTableChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
