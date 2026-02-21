'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { VideoCard, VideoCardData } from '@/components/video/VideoCard';

interface VideoGridProps {
  title: string;
  videos: VideoCardData[];
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  showRank?: boolean;
  /** Max items to show (default: 12 = 2 rows of 6) */
  maxItems?: number;
}

export function VideoGrid({
  title,
  videos,
  href,
  icon,
  badge,
  showRank = false,
  maxItems = 12,
}: VideoGridProps) {
  if (!videos.length) return null;

  // Deduplicate by id before slicing to avoid React key conflicts
  const seen = new Set<string>();
  const displayVideos = videos
    .filter((v) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    })
    .slice(0, maxItems);

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 bg-red-600/20 border border-red-600/30 rounded-full text-red-500 text-[10px] font-bold uppercase">
              {badge}
            </span>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-xs sm:text-sm lg:text-sm transition-colors"
          >
            Xem thêm <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Grid: 3 cols on mobile, 7 on lg desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
        {displayVideos.map((video, i) => (
          <VideoCard key={video.id} video={video} rank={showRank ? i + 1 : undefined} />
        ))}
      </div>
    </section>
  );
}
