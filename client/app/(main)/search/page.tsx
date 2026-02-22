'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { searchApi, videoApi } from '@/lib/api';
import { Loading, Breadcrumb } from '@/components/common';
import type { VideoCardData } from '@/components/common';
import { SearchFilters, SearchHeader, SearchResults, SearchEmpty } from '@/components/search';

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
  const isCategoryBrowse = !!(selectedCategory && !query);

  const breadcrumbItems = isCategoryBrowse
    ? [{ label: 'Thể loại' }, { label: activeGenre?.name || selectedCategory }]
    : [{ label: 'Tìm kiếm' }, { label: '"' + query + '"' }];

  if (!query && !selectedCategory) {
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
        <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6">
            <SearchHeader
              query={query}
              isCategoryBrowse={isCategoryBrowse}
              activeGenre={activeGenre}
              selectedCategory={selectedCategory}
              total={total}
              showFilters={showFilters}
              hasActiveFilters={!!hasActiveFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />

            {showFilters && (
              <SearchFilters
                query={query}
                genres={genres}
                selectedCategory={selectedCategory}
                sortBy={sortBy}
                selectedYear={selectedYear}
                selectedQuality={selectedQuality}
                hasActiveFilters={!!hasActiveFilters}
                onCategoryFilter={handleCategoryFilter}
                onSortChange={setSortBy}
                onYearChange={setSelectedYear}
                onQualityChange={setSelectedQuality}
                onClearFilters={clearFilters}
              />
            )}
          </div>

        {loading && page === 1 ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" text={isCategoryBrowse ? 'Đang tải...' : 'Đang tìm kiếm...'} />
          </div>
        ) : results.length === 0 ? (
          <SearchEmpty isCategoryBrowse={isCategoryBrowse} onGoHome={() => router.push('/')} />
        ) : (
          <SearchResults
            results={results}
            page={page}
            totalPages={totalPages}
            loading={loading}
            onLoadMore={loadMore}
          />
        )}
      </div>
    </div>
  );
}
