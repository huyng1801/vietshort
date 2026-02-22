'use client';

import { useCallback } from 'react';

interface InstagramHeartProps {
  onSingleTap?: () => void;
  children: React.ReactNode;
}

export function InstagramHeart({ onSingleTap, children }: InstagramHeartProps) {
  const handleInteraction = useCallback(() => {
    // Simply call single tap callback
    onSingleTap?.();
  }, [onSingleTap]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    handleInteraction();
  }, [handleInteraction]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only handle click on non-touch devices
    if ('ontouchstart' in window) return;
    handleInteraction();
  }, [handleInteraction]);

  return (
    <div className="relative w-full h-full" onTouchEnd={handleTouchEnd} onClick={handleClick}>
      {children}
    </div>
  );
}
