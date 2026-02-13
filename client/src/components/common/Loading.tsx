'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Loading text */
  text?: string;
  /** Show as full page overlay */
  fullPage?: boolean;
  /** Custom className */
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function Loading({ 
  size = 'md', 
  text, 
  fullPage = false,
  className = '' 
}: LoadingProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-red-500 animate-spin`} />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton loader for video cards
export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[9/16] bg-gray-800 rounded-xl mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
}

// Skeleton loader for horizontal video list
export function VideoListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[180px] md:w-[220px]">
          <VideoCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// Skeleton loader for banner
export function BannerSkeleton() {
  return (
    <div className="animate-pulse h-[50vh] md:h-[60vh] lg:h-[70vh] bg-gray-800">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl space-y-4">
          <div className="flex gap-3">
            <div className="h-6 w-20 bg-gray-700 rounded-full" />
            <div className="h-6 w-16 bg-gray-700 rounded" />
          </div>
          <div className="h-12 bg-gray-700 rounded w-3/4" />
          <div className="h-20 bg-gray-700 rounded w-full" />
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-gray-700 rounded-lg" />
            <div className="h-12 w-32 bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Page loading indicator
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="xl" text="Đang tải..." />
    </div>
  );
}