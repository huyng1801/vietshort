'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { ratingsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface RatingStarsProps {
  videoId: string;
  initialRating?: number;
  averageRating?: number;
  ratingCount?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showAverage?: boolean;
  className?: string;
}

export function RatingStars({
  videoId,
  initialRating = 0,
  averageRating = 0,
  ratingCount = 0,
  size = 'md',
  interactive = true,
  showAverage = true,
  className = '',
}: RatingStarsProps) {
  const { isAuthenticated } = useAuthStore();
  const [userRating, setUserRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating, setAvgRating] = useState(averageRating);
  const [count, setCount] = useState(ratingCount);
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Fetch user's rating on mount
  useEffect(() => {
    if (!isAuthenticated || !videoId || !interactive) return;
    ratingsApi.myRating(videoId)
      .then((res: any) => {
        if (res?.rating) setUserRating(res.rating);
      })
      .catch(() => {});
  }, [videoId, isAuthenticated, interactive]);

  const handleRate = useCallback(async (rating: number) => {
    if (!interactive || loading || !isAuthenticated) return;
    setLoading(true);
    const prevRating = userRating;
    setUserRating(rating);

    try {
      const res = await ratingsApi.rate(videoId, rating);
      if (res?.averageRating != null) setAvgRating(res.averageRating);
      if (res?.ratingCount != null) setCount(res.ratingCount);
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 2000);
    } catch {
      setUserRating(prevRating);
    } finally {
      setLoading(false);
    }
  }, [videoId, userRating, loading, interactive, isAuthenticated]);

  const sizeClasses = {
    sm: 'w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5',
    md: 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7',
    lg: 'w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10',
  };

  const starSize = sizeClasses[size];
  const displayRating = hoverRating || userRating;

  return (
    <div className={`flex flex-col items-center gap-1 sm:gap-1.5 lg:gap-2 ${className}`}>
      {/* Star row */}
      <div className="flex items-center gap-0.5 sm:gap-1 relative">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayRating;
          const halfFilled = !interactive && star <= Math.ceil(avgRating) && star > Math.floor(avgRating);

          return (
            <button
              key={star}
              disabled={!interactive || loading}
              onClick={() => handleRate(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`relative transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${loading ? 'opacity-50' : ''}`}
              aria-label={`${star} sao`}
            >
              <Star
                className={`${starSize} transition-colors ${
                  filled
                    ? 'text-yellow-400 fill-yellow-400'
                    : halfFilled
                      ? 'text-yellow-400 fill-yellow-400/50'
                      : 'text-gray-600'
                }`}
              />
            </button>
          );
        })}

        {/* Thank you animation */}
        {showThankYou && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-fade-up">
            Cảm ơn bạn đánh giá!
          </div>
        )}
      </div>

      {/* Rating info */}
      {showAverage && (
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-xs sm:text-sm lg:text-base">
          <span className="text-yellow-400 font-bold">{avgRating.toFixed(1)}</span>
          <span className="text-gray-500">({formatCount(count)} đánh giá)</span>
        </div>
      )}

      {/* User's rating indicator */}
      {userRating > 0 && interactive && (
        <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium flex items-center gap-0.5 sm:gap-1">
          Bạn đã đánh giá {userRating} <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-yellow-400 fill-yellow-400" />
        </span>
      )}
    </div>
  );
}

// ─── Static Rating Display ──────────────────────────────────
interface RatingDisplayProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function RatingDisplay({ rating, count, size = 'sm', className = '' }: RatingDisplayProps) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5' : 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7';

  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 lg:gap-2 ${className}`}>
      <Star className={`${starSize} text-yellow-400 fill-yellow-400`} />
      <span className={`font-bold text-yellow-400 ${size === 'sm' ? 'text-xs sm:text-sm lg:text-base' : 'text-sm sm:text-base lg:text-lg'}`}>
        {rating.toFixed(1)}
      </span>
      {count != null && (
        <span className={`text-gray-500 ${size === 'sm' ? 'text-[10px] sm:text-xs lg:text-sm' : 'text-xs sm:text-sm lg:text-base'}`}>
          ({formatCount(count)})
        </span>
      )}
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
