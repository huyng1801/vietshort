'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { watchHistoryApi } from '@/lib/api';
import { Loading, Breadcrumb, Pagination } from '@/components/common';
import { HistoryCard, HistoryEmptyState } from '@/components/history';
import type { WatchHistoryItem } from '@/components/history';

interface PaginatedHistory {
  data: WatchHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const _hasHydrated = useHasHydrated();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await watchHistoryApi.list(page, 20) as PaginatedHistory;
        setHistory(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch watch history:', err);
        setError('Không thể tải lịch sử xem');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [_hasHydrated, isAuthenticated, router, page]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const calculateProgress = (progressive: number, duration: number) => {
    if (!duration) return 0;
    return Math.min(Math.round((progressive / duration) * 100), 100);
  };

  if (loading && page === 1) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8 bg-[#0a0a0a]">
      {/* Header */}
      <div className="mx-auto px-2 lg:px-32 pt-20 lg:pt-24 mb-8">
        <Breadcrumb items={[{ label: 'L\u1ecbch s\u1eed xem' }]} />
      </div>

      {/* Content */}
      <div className="mx-auto px-2 lg:px-32">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && history.length === 0 ? (
          <HistoryEmptyState />
        ) : (
          <>
            {/* History Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-8">
              {history.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  formatDate={formatDate}
                  calculateProgress={calculateProgress}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
