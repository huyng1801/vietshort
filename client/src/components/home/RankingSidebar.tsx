'use client';

import Link from 'next/link';
import { Crown, Eye, Star, Play, TrendingUp } from 'lucide-react';
import { VideoCardData } from '@/components/video/VideoCard';

interface RankingSidebarProps {
  title?: string;
  videos: VideoCardData[];
  href?: string;
}

function formatViews(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function RankingSidebar({
  title = 'Bảng Xếp Hạng',
  videos,
  href,
}: RankingSidebarProps) {
  if (!videos.length) return null;

  return (
    <aside className="hidden lg:block w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg lg:text-xl font-extrabold text-red-500">{title}</h2>
      </div>

      {/* Ranking list */}
      <div className="space-y-2">
        {videos.slice(0, 10).map((video, i) => {
          const rank = i + 1;
          const image = video.poster || video.thumbnail || '/images/placeholder.jpg';
          const videoHref = `/watch/${video.slug || video.id}`;

          return (
            <Link
              key={video.id}
                href={videoHref}
                className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              {/* Rank number */}
                <span
                  className={`flex-shrink-0 w-12 h-12 flex items-center justify-center font-extrabold text-3xl ${
                    rank === 1
                      ? 'text-red-500'
                      : rank === 2
                        ? 'text-orange-400'
                        : rank === 3
                          ? 'text-yellow-400'
                          : 'text-gray-600'
                  }`}
                >
                  {rank}
                </span>

              {/* Poster thumbnail */}
                <div className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden bg-gray-800">
                <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundImage: `url(${image})` }}
                />
              </div>

              {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-xl font-semibold line-clamp-1 group-hover:text-red-400 transition-colors">
                  {video.title}
                </h3>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-400">
                  {video.isSerial && video.totalEpisodes && (
                      <span>{video.totalEpisodes} tập</span>
                  )}
                  {video.viewCount != null && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {formatViews(video.viewCount)}
                    </span>
                  )}
                  {video.ratingAverage != null && video.ratingAverage > 0 && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" /> {video.ratingAverage.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
          {href && (
            <Link href={href} className="text-gray-400 hover:text-white text-xl transition-colors mt-6 block text-center font-bold py-3 rounded-lg bg-white/[0.03]">
              Xem thêm &rsaquo;
            </Link>
          )}
      </div>
    </aside>
  );
}
