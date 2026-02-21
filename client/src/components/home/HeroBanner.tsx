'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Play, Star, ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkType?: string | null; // "video" | "external" | "promotion"
  linkTarget?: string | null; // Video ID/slug hoặc external URL
  sortOrder?: number;
}

interface HeroBannerProps {
  items: BannerItem[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % items.length);
  }, [current, items.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + items.length) % items.length);
  }, [current, items.length, goTo]);

  // Auto rotate every 5 seconds
  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [isPaused, next, items.length]);

  // Touch swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) setTouchDelta(e.touches[0].clientX - touchStartX);
  };
  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    if (touchDelta > 60) prev();
    else if (touchDelta < -60) next();
    setTouchStartX(null);
    setTouchDelta(0);
  };

  if (!items.length) return null;

  const item = items[current];
  const isVideoLink = item.linkType === 'video';
  const isExternalLink = item.linkType === 'external';
  
  const getHref = (it: BannerItem) => {
    if (it.linkType === 'external' && it.linkTarget) return it.linkTarget;
    if (it.linkType === 'video' && it.linkTarget) return `/watch/${it.linkTarget}`;
    return '#';
  };
  
  const shouldOpenNewTab = isExternalLink;

  return (
    <section
      className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[75vh] overflow-hidden"
      onMouseEnter={() => {
        setIsPaused(true);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsHovered(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides with cross-fade */}
      {items.map((it, i) => (
        <div
          key={it.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            i === current ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.02] z-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${it.imageUrl})` }}
          />
        </div>
      ))}

      {/* Gradients */}
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-gray-950 via-gray-950/60 to-transparent" />
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/20" />
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 lg:h-32 z-20 bg-gradient-to-t from-gray-950 to-transparent" />

      {/* Content */}
      <div className="relative z-30 h-full mx-auto px-4 sm:px-6 lg:px-32 flex items-end pb-8 sm:pb-12 lg:pb-20">
        <div className="max-w-2xl w-full">
          {/* Title */}
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white my-4 sm:my-6 lg:my-8 leading-[1.6rem] sm:leading-[2rem] md:leading-[2.5rem] lg:leading-[2.8rem] xl:leading-[3.2rem] tracking-tight drop-shadow-2xl">
            {item.title}
          </h1>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            {shouldOpenNewTab ? (
              <a
                href={getHref(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 sm:gap-2 px-5 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-xl sm:rounded-2xl transition-all text-sm sm:text-sm lg:text-base shadow-xl shadow-black/10 hover:shadow-black/20 border-2 border-black/10"
              >
                <Play className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 fill-current" /> Xem ngay
              </a>
            ) : (
              <Link
                href={getHref(item)}
                className="flex items-center gap-2 sm:gap-2 px-5 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-xl sm:rounded-2xl transition-all text-sm sm:text-sm lg:text-base shadow-xl shadow-black/10 hover:shadow-black/20 border-2 border-black/10"
              >
                <Play className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 fill-current" /> Xem ngay
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className={`absolute top-1/2 left-[3%] sm:left-[5%] lg:left-[8%] -translate-y-1/2 z-30 rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            aria-label="Trước"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
          </button>
          <button
            onClick={next}
            className={`absolute top-1/2 right-[3%] sm:right-[5%] lg:right-[8%] -translate-y-1/2 z-30 rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            aria-label="Tiếp theo"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-16 sm:bottom-20 lg:bottom-28 left-1/2 sm:left-3/4 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 sm:w-8 lg:w-10 h-1.5 sm:h-2 bg-white' : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40'}`} />
          ))}
        </div>
      )}

    </section>
  );
}
