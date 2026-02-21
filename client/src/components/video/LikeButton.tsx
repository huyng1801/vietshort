'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Bookmark, BookmarkCheck } from 'lucide-react';
import { likesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface LikeButtonProps {
  videoId: string;
  initialLiked?: boolean;
  likeCount?: number;
  variant?: 'icon' | 'full';
  className?: string;
}

export function LikeButton({ videoId, initialLiked = false, likeCount = 0, variant = 'full', className = '' }: LikeButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check like status on mount
  useEffect(() => {
    if (!isAuthenticated || !videoId) return;
    likesApi.check(videoId)
      .then((res) => setLiked(res.liked))
      .catch(() => {});
  }, [videoId, isAuthenticated]);

  const toggle = useCallback(async () => {
    if (loading) return;
    if (!isAuthenticated) {
      // Could show login prompt
      return;
    }

    setLoading(true);
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
      const res = await likesApi.toggle(videoId);
      setLiked(res.liked);
    } catch {
      // Revert
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLoading(false);
    }
  }, [videoId, liked, loading, isAuthenticated]);

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        className={`relative p-1.5 sm:p-2 rounded-full transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'} ${className}`}
        aria-label={liked ? 'Bỏ thích' : 'Yêu thích'}
      >
        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-transform ${liked ? 'fill-red-500' : ''} ${isAnimating ? 'animate-like-bounce' : ''}`} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex flex-col items-center gap-1 sm:gap-1.5 lg:gap-2 group cursor-pointer ${className}`}
      aria-label={liked ? 'Bỏ thích' : 'Yêu thích'}
    >
      <div className={`relative p-2 sm:p-3 lg:p-4 rounded-full transition-colors ${liked ? 'bg-red-500/10' : 'bg-white/5 group-hover:bg-red-500/10'}`}>
        <Heart className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 transition-all ${liked ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover:text-red-500'} ${isAnimating ? 'animate-like-bounce' : ''}`} />
        {/* Particle burst effect */}
        {isAnimating && liked && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full animate-particle"
                style={{
                  '--angle': `${i * 60}deg`,
                  '--distance': '20px',
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
      <span className={`text-[10px] sm:text-xs lg:text-sm font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-500'}`}>
        {count > 0 ? formatCount(count) : 'Thích'}
      </span>
    </button>
  );
}

// ─── Bookmark Button ─────────────────────────────────────────
interface BookmarkButtonProps {
  videoId: string;
  initialBookmarked?: boolean;
  variant?: 'icon' | 'full';
  className?: string;
}

export function BookmarkButton({ videoId, initialBookmarked = false, variant = 'full', className = '' }: BookmarkButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (loading || !isAuthenticated) return;
    setLoading(true);
    const was = bookmarked;
    setBookmarked(!was);

    try {
      // Reuse likes API or add bookmark endpoint
      // For now toggle bookmark state locally
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      setBookmarked(was);
    } finally {
      setLoading(false);
    }
  }, [videoId, bookmarked, loading, isAuthenticated]);

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'} ${className}`}
        aria-label={bookmarked ? 'Bỏ lưu' : 'Lưu phim'}
      >
        {bookmarked ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-yellow-500" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`flex flex-col items-center gap-1 sm:gap-1.5 lg:gap-2 group cursor-pointer ${className}`}
      aria-label={bookmarked ? 'Bỏ lưu' : 'Lưu phim'}
    >
      <div className={`p-2 sm:p-3 lg:p-4 rounded-full transition-colors ${bookmarked ? 'bg-yellow-500/10' : 'bg-white/5 group-hover:bg-yellow-500/10'}`}>
        {bookmarked
          ? <BookmarkCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-500 fill-yellow-500" />
          : <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400 group-hover:text-yellow-500" />
        }
      </div>
      <span className={`text-[10px] sm:text-xs lg:text-sm font-bold transition-colors ${bookmarked ? 'text-yellow-500' : 'text-gray-500'}`}>
        {bookmarked ? 'Đã lưu' : 'Lưu'}
      </span>
    </button>
  );
}
