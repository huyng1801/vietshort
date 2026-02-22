'use client';

import Link from 'next/link';
import { Play, Eye, Crown, Star } from 'lucide-react';
import type { VideoCardData } from '@/types/video';

export type { VideoCardData } from '@/types/video';

interface VideoCardProps {
  video: VideoCardData;
  rank?: number;
  variant?: 'portrait' | 'landscape';
  className?: string;
}

function formatViews(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoCard({ video, rank, variant = 'portrait', className = '' }: VideoCardProps) {
  const href = `/watch/${video.slug || video.id}`;
  const image = video.poster || video.thumbnail || '/images/placeholder.jpg';

  if (variant === 'landscape') {
    return (
      <Link href={href} className={`group block ${className}`}>
        <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-video">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          {video.isVipOnly && (
            <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded text-[10px] font-bold text-white badge-shimmer-gold shadow-lg" style={{ boxShadow: '0 0 12px rgba(250, 204, 21, 0.8), 0 0 8px rgba(251, 146, 60, 0.6)' }}>
              <Crown className="w-2.5 h-2.5 drop-shadow-lg" /> VIP
            </div>
          )}
          {video.duration && (
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <h3 className="text-white text-xs sm:text-sm lg:text-base font-semibold mt-1.5 sm:mt-2 line-clamp-2 group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs lg:text-sm text-gray-500">
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" /> {formatViews(video.viewCount)}
          </span>
          {video.ratingAverage != null && video.ratingAverage > 0 && (
            <span className="flex items-center gap-0.5 text-yellow-500">
              <Star className="w-3 h-3 fill-current" /> {video.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>
      </Link>
    );
  }

  // Portrait (default - like short drama apps)
  return (
    <Link href={href} className={`group block ${className}`}>
      <div className="relative overflow-hidden rounded-xl bg-gray-800">
        <div className="relative aspect-[2/3]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Hover play */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          </div>

          {/* VIP badge */}
          {video.isVipOnly && (
            <div className="absolute top-2 left-2 flex items-center px-1 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-[10px] font-bold text-white badge-shimmer-gold shadow-lg" style={{ boxShadow: '0 0 12px rgba(250, 204, 21, 0.8), 0 0 8px rgba(251, 146, 60, 0.6)' }}>
              <Crown className="w-3 h-3 drop-shadow-lg" />
            </div>
          )}

          {/* Rank */}
          {rank != null && rank <= 10 && (
            <div className={`absolute bottom-2 left-2 w-8 h-8 flex items-center justify-center rounded-md font-bold text-xl ${
              rank <= 3
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                : 'bg-gray-800/80 text-gray-300'
            }`}>
              {rank}
            </div>
          )}

          {/* Episode count */}
          {video.isSerial && video.totalEpisodes != null && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white">
              {video.totalEpisodes} tập
            </div>
          )}

          {/* View count - bottom left */}
          {video.viewCount != null && (
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {formatViews(video.viewCount)}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white text-xs sm:text-xs lg:text-sm font-semibold mt-1.5 sm:mt-2 line-clamp-2 group-hover:text-red-400 transition-colors leading-tight">
        {video.title}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-[10px] lg:text-xs text-gray-500">
        {video.genres && (
          <span className="truncate">{video.genres.replace(/,/g, ', ')}</span>
        )}
        {video.ratingAverage != null && video.ratingAverage > 0 && (
          <span className="flex items-center gap-0.5 text-yellow-400 shrink-0">
            <Star className="w-3 h-3 fill-current" /> {video.ratingAverage.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
