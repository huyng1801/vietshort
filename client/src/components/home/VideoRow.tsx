'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoCard, VideoCardData } from '@/components/video/VideoCard';

interface VideoRowProps {
  title: string;
  videos: VideoCardData[];
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  showRank?: boolean;
  variant?: 'portrait' | 'landscape';
}

export function VideoRow({
  title,
  videos,
  href,
  icon,
  badge,
  showRank = false,
  variant = 'portrait',
}: VideoRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!videos.length) return null;

  return (
    <section className="py-4 lg:py-6">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg lg:text-xl font-bold text-white">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 bg-red-600/20 border border-red-600/30 rounded-full text-red-500 text-[10px] font-bold">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {href && (
              <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors mr-2">
                Xem thêm &rsaquo;
              </Link>
            )}
            <button
              onClick={() => scroll('left')}
              className="hidden lg:flex w-8 h-8 items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden lg:flex w-8 h-8 items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-3 lg:gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videos.map((video, i) => (
            <div
              key={video.id}
              className={
                variant === 'landscape'
                  ? 'flex-shrink-0 w-[260px] sm:w-[300px] lg:w-[320px]'
                  : 'flex-shrink-0 w-[130px] sm:w-[150px] lg:w-[170px]'
              }
            >
              <VideoCard
                video={video}
                rank={showRank ? i + 1 : undefined}
                variant={variant}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
