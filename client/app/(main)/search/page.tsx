'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { searchApi, videoApi } from '@/lib/api';
import { VideoCard, VideoCardData } from '@/components/video/VideoCard';
import { Loading } from '@/components/common/Loading';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [results, setResults] = useState<VideoCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [genres, setGenres] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Load genres from database
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await videoApi.genres();
        setGenres(data);
      } catch (err) {
        console.error('Failed to load genres:', err);
      }
    };
    loadGenres();
  }, []);

  const doSearch = useCallback(async (pageNum: number) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const searchQuery = selectedCategory ? `${query} category:${selectedCategory}` : query;
      const res = await searchApi.search(searchQuery, pageNum, 20);

      const items = res?.data || res?.items || res?.results || (Array.isArray(res) ? res : []);
      const pagination = res?.pagination || {};

      setResults(pageNum === 1 ? items : (prev: VideoCardData[]) => [...prev, ...items]);
      setTotal(pagination.total || items.length);
      setTotalPages(pagination.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, sortBy, selectedYear, selectedQuality]);

  useEffect(() => {
    if (query) {
      doSearch(1);
    }
  }, [query, selectedCategory, sortBy, selectedYear, selectedQuality, doSearch]);

  const handleCategoryFilter = (cat: string) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSortBy('relevance');
    setSelectedYear('');
    setSelectedQuality('');
  };

  const hasActiveFilters = selectedCategory || sortBy !== 'relevance' || selectedYear || selectedQuality;

  const loadMore = () => {
    if (page < totalPages && !loading) {
      doSearch(page + 1);
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Tìm kiếm phim</h2>
          <p className="text-gray-500 text-sm">Nhập từ khóa để tìm phim yêu thích</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8 bg-[#0a0a0a]">
      <div className="mx-auto px-2 lg:px-32 pt-20 lg:pt-24">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'T\u00ecm ki\u1ebfm' },
            { label: `"${query}"` },
          ]}
        />

        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                K\u1ebft qu\u1ea3 cho &ldquo;{query}&rdquo;
              </h1>
              {total > 0 && (
                <p className="text-gray-500 text-sm mt-1">{total} k\u1ebft qu\u1ea3</p>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters ? 'bg-red-600/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Bộ lọc
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-4 space-y-4">
              {/* Genre Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Thể loại</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Xóa bộ lọc
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {genres.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryFilter(cat.slug)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === cat.slug
                          ? 'bg-red-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Sắp xếp</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'relevance', label: 'Liên quan nhất' },
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'views', label: 'Lượt xem' },
                    { value: 'rating', label: 'Đánh giá' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-red-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">
                  Năm phát hành
                </p>
                <div className="flex flex-wrap gap-2">
                  {['2026', '2025', '2024', '2023', '2022', '2021-2020', '2019-2015'].map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year === selectedYear ? '' : year)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedYear === year
                          ? 'bg-red-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Filter */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">
                  Chất lượng
                </p>
                <div className="flex flex-wrap gap-2">
                  {['1080p', '720p', '540p'].map((quality) => (
                    <button
                      key={quality}
                      onClick={() => setSelectedQuality(quality === selectedQuality ? '' : quality)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedQuality === quality
                          ? 'bg-red-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {loading && page === 1 ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" text="Đang tìm kiếm..." />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Không tìm thấy kết quả</h2>
            <p className="text-gray-500 text-sm mb-6">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-4">
              {results.map((video) => (
                <VideoCard key={video.id} video={video} variant="portrait" />
              ))}
            </div>

            {/* Load More */}
            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Xem thêm kết quả
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
