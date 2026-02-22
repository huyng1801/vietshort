'use client';

import React from 'react';
import {
  Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, Subtitles, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { SubtitleTrack } from './VideoPlayerTypes';
import { SubtitleMenu } from './SubtitleMenu';
import { SpeedMenu } from './SpeedMenu';
import { QualityMenu } from './QualityMenu';
import { formatTime } from './VideoPlayerUtils';
import type { VideoPlayerState } from './useVideoPlayer';

interface PlayerControlsProps {
  state: VideoPlayerState;
  subtitles: SubtitleTrack[];
  hasPrev: boolean;
  hasNext: boolean;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
}

export function PlayerControls({
  state,
  subtitles,
  hasPrev,
  hasNext,
  onPrevEpisode,
  onNextEpisode,
}: PlayerControlsProps) {
  const {
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    playbackSpeed,
    showControls,
    showSpeedMenu,
    showQualityMenu,
    showSubtitleMenu,
    showSettingsMenu,
    showVolumePopup,
    qualityLevels,
    currentQualityLabel,
    currentQuality,
    activeSubtitle,
    subtitleSize,
    subtitleBg,
    seekPreview,
    progressPercent,
    bufferedPercent,
    progressRef,
    volumeSliderRef,
    isDraggingVolumeRef,
    isFullscreen,

    setShowSpeedMenu,
    setShowQualityMenu,
    setShowSubtitleMenu,
    setShowSettingsMenu,
    setShowVolumePopup,
    setActiveSubtitle,
    setSubtitleSize,
    setSubtitleBg,
    setSeekPreview,

    togglePlay,
    toggleMute,
    changeVolume,
    changeSpeed,
    changeQuality,
    toggleFullscreen,
    showControlsTemporarily,

    handleSeekBarInteraction,
    handleSeekBarHover,
  } = state;

  const closeAllMenus = () => {
    setShowSpeedMenu(false);
    setShowQualityMenu(false);
    setShowSubtitleMenu(false);
    setShowSettingsMenu(false);
    setShowVolumePopup(false as any);
  };

  return (
    <div
      className={`absolute inset-0 z-[45] transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => {
        if (showVolumePopup) { setShowVolumePopup(false); return; }
        if (e.target === e.currentTarget) togglePlay();
      }}
    >
      {/* Top gradient + speed badge */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-4 sm:p-6 flex items-start justify-end">
        <div className="flex items-center gap-2 shrink-0">
          {playbackSpeed !== 1 && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-red-600/20 rounded text-xs sm:text-sm lg:text-base text-red-400 font-bold">
              {playbackSpeed}x
            </span>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-16 pb-4 sm:pb-6 px-4 sm:px-6">
        {/* Seek bar */}
        <div
          ref={progressRef}
          className="relative h-6 flex items-center cursor-pointer group/seek mb-2"
          onMouseDown={handleSeekBarInteraction}
          onMouseMove={handleSeekBarHover}
          onMouseLeave={() => setSeekPreview(null)}
          onTouchStart={handleSeekBarInteraction}
        >
          <div className="absolute left-0 right-0 h-1 group-hover/seek:h-1.5 bg-white/20 rounded-full transition-all">
            <div
              className="absolute left-0 top-0 h-full bg-white/20 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercent}% - 6px)` }}
          />
          {seekPreview && (
            <div
              className="absolute bottom-6 -translate-x-1/2 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/80 rounded text-xs sm:text-sm lg:text-base text-white font-medium"
              style={{ left: seekPreview.x }}
            >
              {formatTime(seekPreview.time)}
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-2">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform p-1">
              {isPlaying
                ? <Pause className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6" />
                : <Play className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6 fill-white" />}
            </button>

            {/* Prev/Next episode (desktop) */}
            {hasPrev && onPrevEpisode && (
              <button onClick={onPrevEpisode} className="text-white hover:scale-110 transition-transform p-1 hidden sm:block">
                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
              </button>
            )}
            {hasNext && onNextEpisode && (
              <button onClick={onNextEpisode} className="text-white hover:scale-110 transition-transform p-1 hidden sm:block">
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
              </button>
            )}

            {/* Volume — button + custom vertical slider popup */}
            <div className="hidden sm:block relative">
              <button
                onClick={() => {
                  closeAllMenus();
                  setShowVolumePopup(v => !v);
                }}
                onDoubleClick={toggleMute}
                title="Âm lượng (double-click để tắt tiếng)"
                className="text-white hover:scale-110 transition-transform p-1"
              >
                {isMuted || volume === 0
                  ? <VolumeX className="w-5 h-5" />
                  : volume < 0.5
                    ? <Volume1 className="w-5 h-5" />
                    : <Volume2 className="w-5 h-5" />}
              </button>
              {showVolumePopup && (
                <VolumeSliderPopup
                  volume={volume}
                  isMuted={isMuted}
                  volumeSliderRef={volumeSliderRef}
                  isDraggingVolumeRef={isDraggingVolumeRef}
                  changeVolume={changeVolume}
                  toggleMute={toggleMute}
                />
              )}
            </div>

            {/* Time */}
            <span className="text-white text-xs sm:text-sm lg:text-[13px] tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1 sm:gap-3 lg:gap-1.5">
            {/* Mobile episode navigation */}
            <div className="flex items-center gap-1 sm:hidden">
              {hasPrev && onPrevEpisode && (
                <button onClick={onPrevEpisode} className="text-white p-1">
                  <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              )}
              {hasNext && onNextEpisode && (
                <button onClick={onNextEpisode} className="text-white p-1">
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              )}
            </div>

            {/* Subtitle toggle */}
            {subtitles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    closeAllMenus();
                    setShowSubtitleMenu(!showSubtitleMenu);
                  }}
                  className={`text-white p-1 hover:scale-110 transition-transform ${activeSubtitle ? 'text-red-400' : ''}`}
                >
                  <Subtitles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6" />
                </button>
                {showSubtitleMenu && (
                  <SubtitleMenu
                    subtitles={subtitles}
                    activeSubtitle={activeSubtitle}
                    subtitleSize={subtitleSize}
                    subtitleBg={subtitleBg}
                    onSelect={(id) => { setActiveSubtitle(id); setShowSubtitleMenu(false); }}
                    onSizeChange={setSubtitleSize}
                    onBgToggle={() => setSubtitleBg(!subtitleBg)}
                  />
                )}
              </div>
            )}

            {/* Speed */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAllMenus();
                  setShowSpeedMenu(!showSpeedMenu);
                }}
                className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-2 lg:py-1 text-white text-xs sm:text-sm lg:text-[13px] rounded-md hover:bg-white/10 transition-colors font-medium"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <SpeedMenu
                  playbackSpeed={playbackSpeed}
                  onSpeedChange={changeSpeed}
                />
              )}
            </div>

            {/* Quality selection */}
            {qualityLevels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    closeAllMenus();
                    setShowSettingsMenu(!showSettingsMenu);
                  }}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-2 lg:py-1 text-white text-xs sm:text-sm lg:text-[13px] rounded-md hover:bg-white/10 transition-colors font-medium"
                >
                  {currentQualityLabel}
                </button>
                {showSettingsMenu && (
                  <QualityMenu
                    qualityLevels={qualityLevels}
                    currentQuality={currentQuality}
                    onQualityChange={changeQuality}
                  />
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white p-1 hover:scale-110 transition-transform">
              {isFullscreen
                ? <Minimize className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6" />
                : <Maximize className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Volume Slider Popup ──────────────────────────────────────
interface VolumeSliderPopupProps {
  volume: number;
  isMuted: boolean;
  volumeSliderRef: React.RefObject<HTMLDivElement | null>;
  isDraggingVolumeRef: React.MutableRefObject<boolean>;
  changeVolume: (val: number) => void;
  toggleMute: () => void;
}

function VolumeSliderPopup({
  volume,
  isMuted,
  volumeSliderRef,
  isDraggingVolumeRef,
  changeVolume,
  toggleMute,
}: VolumeSliderPopupProps) {
  const displayVolume = isMuted ? 0 : volume;

  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl px-3 pt-3 pb-2 flex flex-col items-center gap-1.5 shadow-2xl z-50 select-none">
      <span className="text-white text-[10px] font-semibold tabular-nums leading-none">
        {Math.round(displayVolume * 100)}
      </span>
      {/* Custom vertical slider */}
      <div
        ref={volumeSliderRef}
        className="relative w-5 h-24 cursor-pointer flex items-end justify-center"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          isDraggingVolumeRef.current = true;
          const rect = volumeSliderRef.current!.getBoundingClientRect();
          const ratio = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
          changeVolume(ratio);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          isDraggingVolumeRef.current = true;
          const rect = volumeSliderRef.current!.getBoundingClientRect();
          const ratio = 1 - Math.max(0, Math.min(1, (e.touches[0].clientY - rect.top) / rect.height));
          changeVolume(ratio);
        }}
      >
        {/* Track background */}
        <div className="absolute inset-x-0 mx-auto w-1 h-full rounded-full bg-white/20">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-white transition-[height] duration-75"
            style={{ height: `${displayVolume * 100}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-[bottom] duration-75 hover:scale-125"
          style={{ bottom: `calc(${displayVolume * 100}% - 6px)` }}
        />
      </div>
      <button
        onClick={toggleMute}
        className="text-gray-400 hover:text-white transition-colors mt-0.5"
        title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
      >
        {isMuted || volume === 0
          ? <VolumeX className="w-3.5 h-3.5" />
          : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
