import { Loader2 } from 'lucide-react';
import { VideoCard } from '@/components/common';
import type { VideoCardData } from '@/components/common';

interface SearchResultsProps {
  results: VideoCardData[];
  page: number;
  totalPages: number;
  loading: boolean;
  onLoadMore: () => void;
}

export function SearchResults({
  results,
  page,
  totalPages,
  loading,
  onLoadMore,
}: SearchResultsProps) {
  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
        {results.map((video) => (
          <VideoCard key={video.id} video={video} variant="portrait" />
        ))}
      </div>

      {page < totalPages && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Xem thêm
          </button>
        </div>
      )}
    </>
  );
}
