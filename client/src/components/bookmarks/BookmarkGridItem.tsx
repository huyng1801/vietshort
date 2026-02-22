import { Trash2 } from 'lucide-react';
import { VideoCard } from '@/components/common';
import type { BookmarkItem } from './types';

interface BookmarkGridItemProps {
  item: BookmarkItem;
  removing: string | null;
  onRemove: (videoId: string) => void;
  formatDate: (dateString: string) => string;
}

export function BookmarkGridItem({ item, removing, onRemove, formatDate }: BookmarkGridItemProps) {
  return (
    <div className="relative group">
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
          onRemove(item.videoId);
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
      <div className="mt-1 text-xs text-gray-500">Đã lưu {formatDate(item.createdAt)}</div>
    </div>
  );
}
