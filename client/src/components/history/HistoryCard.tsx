import { VideoCard } from '@/components/common';
import type { WatchHistoryItem } from './types';

interface HistoryCardProps {
  item: WatchHistoryItem;
  formatDate: (dateString: string) => string;
  calculateProgress: (progressive: number, duration: number) => number;
}

export function HistoryCard({ item, formatDate, calculateProgress }: HistoryCardProps) {
  const progress = calculateProgress(item.progressive, item.video.duration);
  const episodeNumber = item.episode?.episodeNumber;

  return (
    <div className="relative">
      <VideoCard
        video={{
          id: item.video.id,
          title: item.video.title,
          slug: item.video.slug,
          poster: item.video.poster,
          totalEpisodes: item.video.totalEpisodes,
          isSerial: item.video.isSerial,
          viewCount: item.video.viewCount,
          genres: item.video.genres,
        }}
        variant="portrait"
      />

      {/* Progress Bar Overlay */}
      {progress > 0 && (
        <div className="absolute bottom-16 left-0 right-0 px-2">
          <div className="h-1.5 bg-gray-800/80 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Episode Badge */}
      {episodeNumber && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-xs text-white font-semibold">
          Tập {episodeNumber}
        </div>
      )}

      {/* Watch Status */}
      <div className="mt-1 text-xs text-gray-400">
        {item.isCompleted ? (
          <span className="text-green-400">✓ Đã xem hết</span>
        ) : progress > 0 ? (
          <span className="text-blue-400">Đã xem {progress}%</span>
        ) : (
          <span>{formatDate(item.updatedAt)}</span>
        )}
      </div>
    </div>
  );
}
