'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, Loader2, Film, Tag } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<string>(query ? 'relevance' : 'newest');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [genres, setGenres] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Sync category from URL param
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Load genres
  useEffect(() => {
    videoApi.genres().then(setGenres).catch(console.error);
  }, []);

  const doSearch = useCallback(async (pageNum: number) => {
    if (!query.trim() && !selectedCategory) return;

    setLoading(true);
    try {
      const res = await searchApi.search({
        q: query.trim() || undefined,
        genre: selectedCategory || undefined,
        sort: sortBy as any,
        year: selectedYear || undefined,
        quality: selectedQuality || undefined,
        page: pageNum,
        limit: 24,
      });

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
    doSearch(1);
  }, [query, selectedCategory, sortBy, selectedYear, selectedQuality, doSearch]);

  const handleCategoryFilter = (cat: string) => {
    const next = cat === selectedCategory ? '' : cat;
    setSelectedCategory(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('category', next);
    else params.delete('category');
    router.replace('/search?' + params.toString());
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSortBy(query ? 'relevance' : 'newest');
    setSelectedYear('');
    setSelectedQuality('');
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.replace('/search?' + params.toString());
  };

  const loadMore = () => {
    if (page < totalPages && !loading) doSearch(page + 1);
  };

  const hasActiveFilters =
    selectedCategory ||
    (query ? sortBy !== 'relevance' : sortBy !== 'newest') ||
    selectedYear ||
    selectedQuality;

  const activeGenre = genres.find(g => g.slug === selectedCategory);
  const isCategoryBrowse = !query && selectedCategory;

  const breadcrumbItems = isCategoryBrowse
    ? [{ label: 'The loai' }, { label: activeGenre?.name || selectedCategory }]
    : [{ label: 'Tim kiem' }, { label: '"' + query + '"' }];

  if (!query && !selectedCategory) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Tim kiem phim</h2>
          <p className="text-gray-500 text-sm">Nhap tu khoa de tim phim yeu thich</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8 bg-[#0a0a0a]">
      <div className="mx-auto px-2 lg:px-32 pt-20 lg:pt-24">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              {isCategoryBrowse ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {activeGenre?.name || selectedCategory}
                    </h1>
                  </div>
                  {total > 0 && <p className="text-gray-500 text-xs sm:text-sm">{total} phim</p>}
                </>
              ) : (
                <>
                  <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-white">
                    Ket qua cho &ldquo;{query}&rdquo;
                  </h1>
                  {total > 0 && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                      {total} ket qua{activeGenre ? ' trong "' + activeGenre.name + '"' : ''}
                    </p>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ' + (showFilters || hasActiveFilters ? 'bg-red-600/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Bo loc
              {hasActiveFilters && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full" />}
            </button>
          </div>

          {showFilters && (
            <div className="p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-4 space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider">The loai</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                      <X className="w-3 h-3" /> Xoa bo loc
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {genres.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryFilter(cat.slug)}
                      className={'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ' + (selectedCategory === cat.slug ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white')}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Sap xep</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(query
                    ? [{ value: 'relevance', label: 'Lien quan' }, { value: 'newest', label: 'Moi nhat' }, { value: 'views', label: 'Luot xem' }, { value: 'rating', label: 'Danh gia' }]
                    : [{ value: 'newest', label: 'Moi nhat' }, { value: 'views', label: 'Luot xem' }, { value: 'rating', label: 'Danh gia' }]
                  ).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ' + (sortBy === option.value ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Nam phat hanh</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['2026', '2025', '2024', '2023', '2022', '2021-2020', '2019-2015'].map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year === selectedYear ? '' : year)}
                      className={'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ' + (selectedYear === year ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white')}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Chat luong</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['1080p', '720p', '540p'].map((quality) => (
                    <button
                      key={quality}
                      onClick={() => setSelectedQuality(quality === selectedQuality ? '' : quality)}
                      className={'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ' + (selectedQuality === quality ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white')}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && page === 1 ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" text={isCategoryBrowse ? 'Dang tai...' : 'Dang tim kiem...'} />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            {isCategoryBrowse ? <Film className="w-12 h-12 text-gray-700 mx-auto mb-4" /> : <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />}
            <h2 className="text-base sm:text-lg font-bold text-white mb-2">Khong tim thay ket qua</h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-6">Thu tim kiem voi tu khoa khac hoac thay doi bo loc</p>
            <button onClick={() => router.push('/')} className="px-5 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors">
              Ve trang chu
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
              {results.map((video) => (
                <VideoCard key={video.id} video={video} variant="portrait" />
              ))}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Xem them
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
