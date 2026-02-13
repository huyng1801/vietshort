'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  type: 'video' | 'series';
}

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
}

// Mock trending searches
const trendingSearches = [
  'Tình yêu',
  'Hành động',
  'Phim Hàn',
  'Kinh dị',
  'Hài',
];

export function SearchBar({ onClose, className = '' }: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        // const data = await response.json();
        // setResults(data.results);
        
        // Mock results for now
        await new Promise(resolve => setTimeout(resolve, 300));
        setResults([
          { id: '1', title: `${debouncedQuery} - Kết quả 1`, thumbnail: '/images/thumb-1.jpg', type: 'video' },
          { id: '2', title: `${debouncedQuery} - Kết quả 2`, thumbnail: '/images/thumb-2.jpg', type: 'series' },
        ]);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to search page
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsFocused(false);
    onClose?.();
  };

  const handleSearchClick = (search: string) => {
    setQuery(search);
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const showDropdown = isFocused && (query || recentSearches.length > 0 || trendingSearches.length > 0);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Tìm kiếm phim..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Kết quả</p>
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/watch/${result.id}`}
                  onClick={() => setIsFocused(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors"
                >
                  <div 
                    className="w-12 h-16 bg-gray-700 rounded bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${result.thumbnail})` }}
                  />
                  <div>
                    <p className="text-white text-sm line-clamp-2">{result.title}</p>
                    <p className="text-gray-500 text-xs">
                      {result.type === 'series' ? 'Phim bộ' : 'Phim lẻ'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No results */}
          {!isLoading && query && results.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              Không tìm thấy kết quả
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="py-2 border-b border-gray-700">
              <div className="flex items-center justify-between px-4 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">Tìm kiếm gần đây</p>
                <button 
                  onClick={clearRecentSearches}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Xóa
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(search)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors"
                >
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300 text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {!query && (
            <div className="py-2">
              <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Xu hướng tìm kiếm
              </p>
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(search)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors"
                >
                  <span className="w-5 h-5 bg-red-600/20 text-red-500 rounded text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-300 text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}