'use client';

import { VideoPlayerProps } from './VideoPlayerTypes';
import { useVideoPlayer } from './useVideoPlayer';
import { PlayerOverlays } from './PlayerOverlays';
import { PlayerControls } from './PlayerControls';

// Re-export types for backward compatibility
export type { SubtitleTrack, QualityLevel } from './VideoPlayerTypes';

// ─── Main Component ───────────────────────────────────────────
export function VideoPlayer({
  src,
  poster,
  title,
  episodeNumber,
  subtitles = [],
  onEnded,
  onPrevEpisode,
  onNextEpisode,
  onProgress,
  hasPrev = false,
  hasNext = false,
  autoPlay = true,
  initialTime = 0,
}: VideoPlayerProps) {
  const state = useVideoPlayer({
    src,
    subtitles,
    onEnded,
    onProgress,
    autoPlay,
    initialTime,
  });

  const {
    videoRef,
    containerRef,
    showControls,
    isPlaying,
    isLoading,
    isLongPress,
    doubleTapSide,
    currentSubtitleText,
    subtitleSize,
    subtitleBg,
    showVolumePopup,
    togglePlay,
    showControlsTemporarily,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setShowVolumePopup,
  } = state;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group select-none"
      onMouseMove={showControlsTemporarily}
      tabIndex={0}
      role="application"
      aria-label="Video player"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        preload="metadata"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Overlays: spinner, gestures, subtitles, center play */}
      <PlayerOverlays
        isLoading={isLoading}
        isPlaying={isPlaying}
        isLongPress={isLongPress}
        doubleTapSide={doubleTapSide}
        currentSubtitleText={currentSubtitleText}
        subtitleSize={subtitleSize}
        subtitleBg={subtitleBg}
        showControls={showControls}
        togglePlay={togglePlay}
      />

      {/* Controls: seek bar, buttons, menus */}
      <PlayerControls
        state={state}
        subtitles={subtitles}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrevEpisode={onPrevEpisode}
        onNextEpisode={onNextEpisode}
      />

      {/* Click overlay for play/pause (desktop, controls hidden) */}
      {!showControls && (
        <div
          className="absolute inset-0 z-20 cursor-pointer hidden lg:block"
          onClick={togglePlay}
          onMouseMove={showControlsTemporarily}
        />
      )}
    </div>
  );
}
