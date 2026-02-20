'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Clock, Loader2, Film, Tv, Star } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchApi } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';

interface SearchResult {
  id: string;
  title: string;
  slug?: string;
  poster?: string;
  thumbnail?: string;
  genres?: string;
  ratingAverage?: number;
  isSerial?: boolean;
  totalEpisodes?: number;
  viewCount?: number;
}

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
}



export function SearchBar({ onClose, className = '' }: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  // Đã bỏ filter

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vietshort-recent-searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const abortController = new AbortController();

    const doSearch = async () => {
      setIsLoading(true);
      try {
        const searchRes = await searchApi.search(debouncedQuery, 1, 6);

        if (!abortController.signal.aborted) {
          const data = searchRes;
          const items = Array.isArray(data) ? data : data?.data || data?.items || [];
          setResults(items);
        }
      } catch {
        // Silent fail - keep UI responsive
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false);
      }
    };

    doSearch();
    return () => abortController.abort();
  }, [debouncedQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearch = (search: string) => {
    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem('vietshort-recent-searches', JSON.stringify(updated));
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveSearch(query.trim());
    // Đã bỏ filter category, không cần categoryParam
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsFocused(false);
    onClose?.();
  };

  const handleSearchClick = (search: string) => {
    setQuery(search);
    saveSearch(search);
    router.push(`/search?q=${encodeURIComponent(search)}`);
    setIsFocused(false);
    onClose?.();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('vietshort-recent-searches');
    } catch {}
  };

  const removeRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    try {
      localStorage.setItem('vietshort-recent-searches', JSON.stringify(updated));
    } catch {}
  };

  const showDropdown = isFocused && (query || recentSearches.length > 0);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Tìm kiếm phim, diễn viên, thể loại..."
              className="w-full pl-10 sm:pl-14 pr-10 sm:pr-14 py-2.5 sm:py-3 lg:py-3.5 bg-gray-800/80 border !border-gray-700/60 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 outline-none focus:outline-none focus:!border-gray-700/60 focus-visible:outline-none focus-visible:!border-gray-700/60 active:!border-gray-700/60 transition-all text-sm sm:text-base lg:text-base"
              autoComplete="off"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors">
                <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tìm kiếm...</span>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-1.5">
              <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Kết quả</p>
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/watch/${result.slug || result.id}`}
                  onClick={() => { saveSearch(query); setIsFocused(false); onClose?.(); }}
                  className="flex items-center gap-3 sm:gap-5 px-4 sm:px-7 py-2.5 sm:py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-12 h-16 sm:w-16 sm:h-20 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-gray-800">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${result.poster || result.thumbnail || '/images/placeholder.jpg'})` }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm sm:text-sm lg:text-base font-semibold line-clamp-1">{result.title}</p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                      <span className="text-gray-200 text-xs sm:text-sm lg:text-base flex items-center gap-1">
                        {result.isSerial ? <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> : <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                        {result.isSerial ? `Phim bộ · ${result.totalEpisodes || '?'} tập` : 'Phim lẻ'}
                      </span>
                      {result.ratingAverage != null && result.ratingAverage > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400 text-xs sm:text-sm lg:text-base">
                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 fill-current" />
                          {result.ratingAverage.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {result.genres && (
                      <p className="text-gray-100 text-xs sm:text-sm lg:text-base mt-1 sm:mt-2 truncate">{result.genres}</p>
                    )}
                  </div>
                </Link>
              ))}
              {/* View all results */}
              <button
                onClick={handleSubmit as any}
                className="w-full text-center py-3 sm:py-3 text-red-400 hover:text-red-300 text-sm sm:text-sm lg:text-base font-semibold hover:bg-white/5 transition-colors border-t border-gray-800/50"
              >
                Xem tất cả kết quả cho "{query}"
              </button>
            </div>
          )}

          {/* No results */}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm sm:text-sm lg:text-base">Không tìm thấy kết quả cho "{query}"</p>
              <p className="text-gray-500 text-xs sm:text-sm lg:text-base mt-2">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="py-2 border-b border-gray-800/50">
              <div className="flex items-center justify-between px-6 py-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tìm kiếm gần đây</p>
                <button onClick={clearRecentSearches} className="text-xs text-red-400 hover:text-red-300 font-semibold">
                  Xóa tất cả
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(search)}
                  className="flex items-center gap-4 w-full px-6 py-3 text-left hover:bg-white/5 transition-colors group"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-500" />
                  <span className="text-gray-200 text-sm sm:text-sm lg:text-base flex-1">{search}</span>
                  <button
                    onClick={(e) => removeRecentSearch(search, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-200 transition-all"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </button>
                </button>
              ))}
            </div>
          )}


        </div>
      )}
    </div>
  );
}