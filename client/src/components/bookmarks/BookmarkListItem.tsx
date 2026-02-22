import { Film, Play, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { BookmarkItem } from './types';

interface BookmarkListItemProps {
  item: BookmarkItem;
  removing: string | null;
  onRemove: (videoId: string) => void;
  formatDate: (dateString: string) => string;
}

export function BookmarkListItem({ item, removing, onRemove, formatDate }: BookmarkListItemProps) {
  const watchUrl = `/watch/${item.video.slug || item.video.id}`;

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-800/40 hover:bg-gray-800/60 rounded-xl border border-gray-700/30 transition-colors group">
      {/* Thumbnail */}
      <Link
        href={watchUrl}
        className="flex-shrink-0 w-28 sm:w-36 aspect-[2/3] overflow-hidden rounded-lg bg-gray-800 relative"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.video.poster || '/images/placeholder.jpg'})` }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <Play className="w-8 h-8 text-white" />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={watchUrl}>
          <h3 className="text-white font-semibold text-lg line-clamp-2 hover:text-red-400 transition-colors">
            {item.video.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
          {item.video.genres && <span>{item.video.genres}</span>}
          {item.video.totalEpisodes && (
            <span className="flex items-center gap-1">
              <Film className="w-3.5 h-3.5" />
              {item.video.totalEpisodes} tập
            </span>
          )}
          {item.video.ratingAverage != null && item.video.ratingAverage > 0 && (
            <span className="text-yellow-500">★ {item.video.ratingAverage.toFixed(1)}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">Đã lưu {formatDate(item.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <Link
          href={watchUrl}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          Xem
        </Link>
        <button
          onClick={() => onRemove(item.videoId)}
          disabled={removing === item.videoId}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Bỏ đánh dấu"
        >
          {removing === item.videoId ? (
            <div className="w-5 h-5 border-2 border-gray-500/40 border-t-gray-500 rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
