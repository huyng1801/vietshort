'use client';

import {
  Play, SkipForward, SkipBack, Loader2, FastForward,
} from 'lucide-react';
import { getSubtitleSizeClass } from './VideoPlayerUtils';

interface PlayerOverlaysProps {
  isLoading: boolean;
  isPlaying: boolean;
  isLongPress: boolean;
  doubleTapSide: 'left' | 'right' | null;
  currentSubtitleText: string;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitleBg: boolean;
  showControls: boolean;
  togglePlay: () => void;
}

export function PlayerOverlays({
  isLoading,
  isPlaying,
  isLongPress,
  doubleTapSide,
  currentSubtitleText,
  subtitleSize,
  subtitleBg,
  showControls,
  togglePlay,
}: PlayerOverlaysProps) {
  const subtitleSizeClass = getSubtitleSizeClass(subtitleSize);

  return (
    <>
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-white animate-spin" />
        </div>
      )}

      {/* Long Press 2x Indicator */}
      {isLongPress && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm lg:text-base font-bold flex items-center gap-1.5">
          <FastForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
          2x
        </div>
      )}

      {/* Double Tap Ripple (left/right) */}
      {doubleTapSide && (
        <div className={`absolute top-0 bottom-0 ${doubleTapSide === 'left' ? 'left-0 right-1/2' : 'left-1/2 right-0'} z-30 flex items-center justify-center pointer-events-none`}>
          <div className="flex items-center gap-1 text-white text-base sm:text-lg lg:text-xl font-bold animate-scale-in">
            {doubleTapSide === 'left'
              ? <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7" />
              : <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7" />}
            <span>10s</span>
          </div>
        </div>
      )}

      {/* Subtitle Overlay */}
      {currentSubtitleText && (
        <div className={`absolute left-4 right-4 z-40 flex justify-center pointer-events-none transition-all duration-300 ${showControls ? 'bottom-24 sm:bottom-28' : 'bottom-6 sm:bottom-8'}`}>
          <span className={`${subtitleSizeClass} font-medium text-white text-center px-3 py-1.5 rounded-md max-w-[80%] leading-relaxed ${subtitleBg ? 'bg-black/60 backdrop-blur-sm' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}>
            {currentSubtitleText}
          </span>
        </div>
      )}

      {/* Center play button (when paused) */}
      {!isPlaying && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-[44]"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20 bg-black/70 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 lg:w-10 lg:h-10 text-white fill-white ml-1" />
          </div>
        </div>
      )}
    </>
  );
}
