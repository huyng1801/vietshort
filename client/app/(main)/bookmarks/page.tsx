'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bookmark,
  Play,
  Trash2,
  Grid3X3,
  List,
  Search,
  Film,
  SortDesc,
  Filter,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { bookmarksApi } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { VideoCard } from '@/components/video/VideoCard';
import { Breadcrumb } from '@/components/common/Breadcrumb';

interface BookmarkItem {
  id: string;
  videoId: string;
  createdAt: string;
  video: {
    id: string;
    title: string;
    slug: string;
    poster: string;
    thumbnail?: string;
    viewCount?: number;
    ratingAverage?: number;
    isVipOnly?: boolean;
    totalEpisodes?: number;
    isSerial?: boolean;
    genres?: string;
    releaseYear?: number;
  };
}

interface PaginatedBookmarks {
  data: BookmarkItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type SortOption = 'newest' | 'oldest' | 'name';
type ViewMode = 'grid' | 'list';

export default function BookmarksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const _hasHydrated = useHasHydrated();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const fetchBookmarks = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = (await bookmarksApi.list(pageNum, 20)) as PaginatedBookmarks;
      setBookmarks(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      setError('Không thể tải danh sách đánh dấu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchBookmarks(page);
  }, [_hasHydrated, isAuthenticated, router, page, fetchBookmarks]);

  const handleRemoveBookmark = async (videoId: string) => {
    try {
      setRemoving(videoId);
      await bookmarksApi.toggle(videoId);
      setBookmarks((prev) => prev.filter((b) => b.videoId !== videoId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    } finally {
      setRemoving(null);
    }
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

  // Client-side filter and sort
  const filteredBookmarks = bookmarks
    .filter((b) => {
      if (!searchQuery) return true;
      return b.video.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.video.title.localeCompare(b.video.title, 'vi');
        default:
          return 0;
      }
    });

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loading size="lg" text="Đang tải danh sách đánh dấu..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8 bg-[#0a0a0a]">
      {/* Header */}
      <div className="mx-auto px-2 lg:px-32 pt-20 lg:pt-24 mb-8">
        <Breadcrumb items={[{ label: '\u0110\u00e1nh d\u1ea5u' }]} />
      </div>

      {/* Content */}
      <div className="mx-auto px-2 lg:px-32">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && filteredBookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có phim được đánh dấu'}
            </h3>
            <p className="text-gray-400 mb-8">
              {searchQuery
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Nhấn biểu tượng đánh dấu khi xem phim để lưu vào đây'}
            </p>
            {!searchQuery && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Play className="w-5 h-5" />
                Khám phá ngay
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-8">
              {filteredBookmarks.map((item) => (
                <div key={item.id} className="relative group">
                  <VideoCard
                    video={{
                      id: item.video.id,
                      title: item.video.title,
                      slug: item.video.slug,
                      poster: item.video.poster,
                      thumbnail: item.video.thumbnail,
                      viewCount: item.video.viewCount,
                      ratingAverage: item.video.ratingAverage,
                      isVipOnly: item.video.isVipOnly,
                      totalEpisodes: item.video.totalEpisodes,
                      isSerial: item.video.isSerial,
                      genres: item.video.genres,
                      releaseYear: item.video.releaseYear,
                    }}
                    variant="portrait"
                  />
                  {/* Remove Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveBookmark(item.videoId);
                    }}
                    disabled={removing === item.videoId}
                    className="absolute top-2 right-2 p-2 bg-black/70 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all z-10"
                    title="Bỏ đánh dấu"
                  >
                    {removing === item.videoId ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                  {/* Added date */}
                  <div className="mt-1 text-xs text-gray-500">
                    Đã lưu {formatDate(item.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* List View */}
            <div className="space-y-3 mb-8">
              {filteredBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-gray-800/40 hover:bg-gray-800/60 rounded-xl border border-gray-700/30 transition-colors group"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/watch/${item.video.slug || item.video.id}`}
                    className="flex-shrink-0 w-28 sm:w-36 aspect-[2/3] overflow-hidden rounded-lg bg-gray-800 relative"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.video.poster || '/images/placeholder.jpg'})` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/watch/${item.video.slug || item.video.id}`}>
                      <h3 className="text-white font-semibold text-lg line-clamp-2 hover:text-red-400 transition-colors">
                        {item.video.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                      {item.video.genres && <span>{item.video.genres}</span>}
                      {item.video.totalEpisodes && (
                        <span className="flex items-center gap-1">
                          <Film className="w-3.5 h-3.5" />
                          {item.video.totalEpisodes} tập
                        </span>
                      )}
                      {item.video.ratingAverage != null && item.video.ratingAverage > 0 && (
                        <span className="text-yellow-500">
                          ★ {item.video.ratingAverage.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Đã lưu {formatDate(item.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Link
                      href={`/watch/${item.video.slug || item.video.id}`}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Xem
                    </Link>
                    <button
                      onClick={() => handleRemoveBookmark(item.videoId)}
                      disabled={removing === item.videoId}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Bỏ đánh dấu"
                    >
                      {removing === item.videoId ? (
                        <div className="w-5 h-5 border-2 border-gray-500/40 border-t-gray-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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
      </div>
    </div>
  );
}
