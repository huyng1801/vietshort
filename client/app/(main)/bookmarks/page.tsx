'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { bookmarksApi } from '@/lib/api';
import { Loading, Breadcrumb, Pagination } from '@/components/common';
import {
  BookmarkGridItem,
  BookmarkListItem,
  BookmarkEmptyState,
} from '@/components/bookmarks';
import type { BookmarkItem } from '@/components/bookmarks';

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
  const [searchQuery] = useState('');
  const [sortBy] = useState<SortOption>('newest');
  const [viewMode] = useState<ViewMode>('grid');

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
          <BookmarkEmptyState searchQuery={searchQuery} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-8">
            {filteredBookmarks.map((item) => (
              <BookmarkGridItem
                key={item.id}
                item={item}
                removing={removing}
                onRemove={handleRemoveBookmark}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {filteredBookmarks.map((item) => (
              <BookmarkListItem
                key={item.id}
                item={item}
                removing={removing}
                onRemove={handleRemoveBookmark}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        )}
      </div>
    </div>
  );
}
