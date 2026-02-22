import { Tag, SlidersHorizontal } from 'lucide-react';

interface SearchHeaderProps {
  query: string;
  isCategoryBrowse: boolean;
  activeGenre: { name: string } | undefined;
  selectedCategory: string;
  total: number;
  showFilters: boolean;
  hasActiveFilters: boolean;
  onToggleFilters: () => void;
}

export function SearchHeader({
  query,
  isCategoryBrowse,
  activeGenre,
  selectedCategory,
  total,
  showFilters,
  hasActiveFilters,
  onToggleFilters,
}: SearchHeaderProps) {
  return (
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
              Kết quả cho &ldquo;{query}&rdquo;
            </h1>
            {total > 0 && (
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                {total} kết quả{activeGenre ? ` trong "${activeGenre.name}"` : ''}
              </p>
            )}
          </>
        )}
      </div>

      <button
        onClick={onToggleFilters}
        className={
          'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ' +
          (showFilters || hasActiveFilters
            ? 'bg-red-600/10 text-red-400 border border-red-500/20'
            : 'bg-white/5 text-gray-400 hover:bg-white/10')
        }
      >
        <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        Bộ lọc
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full" />
        )}
      </button>
    </div>
  );
}
