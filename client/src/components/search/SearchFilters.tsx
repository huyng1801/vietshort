import { X } from 'lucide-react';

interface SearchFiltersProps {
  query: string;
  genres: { id: string; name: string; slug: string }[];
  selectedCategory: string;
  sortBy: string;
  selectedYear: string;
  selectedQuality: string;
  hasActiveFilters: boolean;
  onCategoryFilter: (slug: string) => void;
  onSortChange: (sort: string) => void;
  onYearChange: (year: string) => void;
  onQualityChange: (quality: string) => void;
  onClearFilters: () => void;
}

const chipClass = (active: boolean) =>
  'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ' +
  (active ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white');

export function SearchFilters({
  query,
  genres,
  selectedCategory,
  sortBy,
  selectedYear,
  selectedQuality,
  hasActiveFilters,
  onCategoryFilter,
  onSortChange,
  onYearChange,
  onQualityChange,
  onClearFilters,
}: SearchFiltersProps) {
  const sortOptions = query
    ? [
        { value: 'relevance', label: 'Liên quan' },
        { value: 'newest', label: 'Mới nhất' },
        { value: 'views', label: 'Lượt xem' },
        { value: 'rating', label: 'Đánh giá' },
      ]
    : [
        { value: 'newest', label: 'Mới nhất' },
        { value: 'views', label: 'Lượt xem' },
        { value: 'rating', label: 'Đánh giá' },
      ];

  return (
    <div className="p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-4 space-y-3 sm:space-y-4">
      {/* Genre */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider">
            Thể loại
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Xóa bộ lọc
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {genres.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onCategoryFilter(cat.slug)}
              className={chipClass(selectedCategory === cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">
          Sắp xếp
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={chipClass(sortBy === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Year */}
      <div>
        <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">
          Năm phát hành
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['2026', '2025', '2024', '2023', '2022', '2021-2020', '2019-2015'].map((year) => (
            <button
              key={year}
              onClick={() => onYearChange(year === selectedYear ? '' : year)}
              className={chipClass(selectedYear === year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div>
        <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">
          Chất lượng
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['1080p', '720p', '540p'].map((quality) => (
            <button
              key={quality}
              onClick={() => onQualityChange(quality === selectedQuality ? '' : quality)}
              className={chipClass(selectedQuality === quality)}
            >
              {quality}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
