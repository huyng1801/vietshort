'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Star, ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';

export interface BannerItem {
  id: string;
  title: string;
  description: string;
  poster?: string;
  genres?: string;
  releaseYear?: number;
  ratingAverage?: number;
  ratingCount?: number;
  viewCount?: number;
  isVipOnly?: boolean;
  slug: string;
}

interface HeroBannerProps {
  items: BannerItem[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [isPaused, next, items.length]);

  if (!items.length) return null;

  const item = items[current];
  const genreList = item.genres?.split(',').map((g) => g.trim()).filter(Boolean) || [];

  return (
    <section
      className="relative w-full h-[55vh] sm:h-[60vh] lg:h-[75vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url(${item.poster || '/images/placeholder.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-[1800px] mx-auto px-4 lg:px-8 flex items-end pb-16 lg:pb-20">
        <div className="max-w-2xl">
          {/* Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {genreList.slice(0, 3).map((g) => (
              <span key={g} className="px-2.5 py-0.5 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded">
                {g}
              </span>
            ))}
            {item.releaseYear && <span className="text-gray-400 text-sm">{item.releaseYear}</span>}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            {item.title}
          </h1>

          {/* Rating & Stats */}
          <div className="flex items-center gap-3 mb-3 text-sm">
            {item.ratingAverage != null && item.ratingAverage > 0 && (
              <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                <Star className="w-4 h-4 fill-current" />
                {item.ratingAverage.toFixed(1)}
                {item.ratingCount != null && (
                  <span className="text-gray-400 font-normal">({item.ratingCount})</span>
                )}
              </span>
            )}
            {item.isVipOnly && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded">
                VIP
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm lg:text-base mb-5 line-clamp-2 lg:line-clamp-3 max-w-xl">
            {item.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/watch/${item.slug || item.id}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              Xem ngay
            </Link>
            <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Thumbnail indicators (bottom-right like FPT Play) */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-4 lg:right-8 flex items-center gap-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => setCurrent(i)}
              className={`w-16 h-9 lg:w-20 lg:h-11 rounded overflow-hidden border-2 transition-all ${
                i === current ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${it.poster || '/images/placeholder.jpg'})` }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {items.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${((current + 1) / items.length) * 100}%` }}
          />
        </div>
      )}
    </section>
  );
}
