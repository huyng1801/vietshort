'use client';

import { useState, useEffect } from 'react';
import { History, Clock, Play, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { watchHistoryApi } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { VideoCard } from '@/components/video/VideoCard';
import { Breadcrumb } from '@/components/common/Breadcrumb';

interface WatchHistoryItem {
  id: string;
  videoId: string;
  episodeId?: string;
  watchTime: number;
  progressive: number;
  isCompleted: boolean;
  updatedAt: string;
  video: {
    id: string;
    title: string;
    slug: string;
    poster: string;
    duration: number;
    totalEpisodes?: number;
    isSerial?: boolean;
    viewCount?: number;
    genres?: string;
  };
  episode?: {
    episodeNumber: number;
    title?: string;
  };
}

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
  const { user, isAuthenticated } = useAuthStore();
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

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3">Chưa có lịch sử xem</h3>
            <p className="text-gray-400 mb-8">Bắt đầu xem phim để lưu lại lịch sử</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
            >
              <Play className="w-5 h-5" />
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <>
            {/* History Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-8">
              {history.map((item) => {
                const progress = calculateProgress(item.progressive, item.video.duration);
                const episodeNumber = item.episode?.episodeNumber;
                
                return (
                  <div key={item.id} className="relative">
                    <VideoCard
                      video={{
                        id: item.video.id,
                        title: item.video.title,
                        slug: item.video.slug,
                        poster: item.video.poster,
                        totalEpisodes: item.video.totalEpisodes,
                        isSerial: item.video.isSerial,
                        viewCount: item.video.viewCount,
                        genres: item.video.genres,
                      }}
                      variant="portrait"
                    />
                    {/* Progress Bar Overlay */}
                    {progress > 0 && (
                      <div className="absolute bottom-16 left-0 right-0 px-2">
                        <div className="h-1.5 bg-gray-800/80 rounded-full overflow-hidden backdrop-blur-sm">
                          <div
                            className="h-full bg-red-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {/* Episode Info */}
                    {episodeNumber && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-xs text-white font-semibold">
                        Tập {episodeNumber}
                      </div>
                    )}
                    {/* Watch Status */}
                    <div className="mt-1 text-xs text-gray-400">
                      {item.isCompleted ? (
                        <span className="text-green-400">✓ Đã xem hết</span>
                      ) : progress > 0 ? (
                        <span className="text-blue-400">Đã xem {progress}%</span>
                      ) : (
                        <span>{formatDate(item.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-colors"
                >
                  Trước
                </button>
                <span className="text-gray-400">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
