'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, Subtitles, ChevronLeft, ChevronRight,
  Loader2, FastForward
} from 'lucide-react';
import Hls from 'hls.js';
import { PLAYER_SETTINGS } from '@/lib/constants';
import { SubtitleTrack, QualityLevel, VideoPlayerProps } from './VideoPlayerTypes';
import { SubtitleMenu } from './SubtitleMenu';
import { SpeedMenu } from './SpeedMenu';
import { QualityMenu } from './QualityMenu';
import { formatTime, getSubtitleSizeClass } from './VideoPlayerUtils';

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
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [subtitleBg, setSubtitleBg] = useState(true);
  const [currentSubtitleText, setCurrentSubtitleText] = useState('');
  const [seekPreview, setSeekPreview] = useState<{ time: number; x: number } | null>(null);
  const [doubleTapSide, setDoubleTapSide] = useState<'left' | 'right' | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [touchVolumeBase, setTouchVolumeBase] = useState<number | null>(null);
  const [touchYStart, setTouchYStart] = useState<number | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  // ─── HLS Setup ────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (src.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1, // Auto quality
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data.levels.map((l) => ({
          height: l.height,
          bitrate: l.bitrate,
          label: `${l.height}p`,
        }));
        setQualityLevels(levels);
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    } else {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  // Set initial time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !initialTime) return;
    const trySetTime = () => {
      if (video.readyState >= 1 && initialTime > 0) {
        video.currentTime = initialTime;
      }
    };
    video.addEventListener('loadedmetadata', trySetTime);
    return () => video.removeEventListener('loadedmetadata', trySetTime);
  }, [initialTime, src]);

  // ─── Video Event Listeners ────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onEnd = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('ended', onEnd);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('ended', onEnd);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, [onEnded]);

  // Report progress periodically
  useEffect(() => {
    if (!onProgress) return;
    progressTimerRef.current = setInterval(() => {
      if (videoRef.current && isPlaying) {
        onProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, PLAYER_SETTINGS.PROGRESS_SAVE_INTERVAL);
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [onProgress, isPlaying]);

  // ─── Controls Visibility ──────────────────────────────────
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying && !showSpeedMenu && !showQualityMenu && !showSubtitleMenu && !showSettingsMenu) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, showSpeedMenu, showQualityMenu, showSubtitleMenu, showSettingsMenu]);

  useEffect(() => {
    if (isPlaying) showControlsTemporarily();
    else setShowControls(true);
  }, [isPlaying, showControlsTemporarily]);

  // ─── Playback Controls ────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const changeVolume = useCallback((val: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.max(0, Math.min(1, val));
    if (val > 0 && video.muted) video.muted = false;
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0));
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const skipForward = useCallback(() => {
    seek((videoRef.current?.currentTime || 0) + PLAYER_SETTINGS.SEEK_STEP);
  }, [seek]);

  const skipBack = useCallback(() => {
    seek((videoRef.current?.currentTime || 0) - PLAYER_SETTINGS.SEEK_STEP);
  }, [seek]);

  const changeSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    setShowSettingsMenu(false);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const changeQuality = useCallback((level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level; // -1 = auto
    }
    setCurrentQuality(level);
    setShowQualityMenu(false);
    setShowSettingsMenu(false);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // ─── Fullscreen ────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
        // Lock to landscape if available
        try {
          await (screen.orientation as any)?.lock?.('landscape');
        } catch {}
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        try {
          (screen.orientation as any)?.unlock?.();
        } catch {}
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ─── Keyboard Controls ────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only handle when player is focused or fullscreen
      if (!containerRef.current?.contains(document.activeElement) && !isFullscreen) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(volume - 0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          setShowSpeedMenu(false);
          setShowQualityMenu(false);
          setShowSubtitleMenu(false);
          setShowSettingsMenu(false);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, skipBack, skipForward, changeVolume, toggleMute, toggleFullscreen, volume, isFullscreen]);

  // ─── Touch & Gesture Handling ─────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relX = (touch.clientX - rect.left) / rect.width;
    const relY = touch.clientY;

    // Long press detection → 2x speed
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      if (videoRef.current) videoRef.current.playbackRate = 2;
    }, 500);

    // Volume gesture on right side
    if (relX > 0.7) {
      setTouchVolumeBase(volume);
      setTouchYStart(relY);
    }

    // Track taps for double-tap
    tapCountRef.current += 1;
    if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
    doubleTapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current === 1) {
        // Single tap: toggle controls
        if (showControls) setShowControls(false);
        else showControlsTemporarily();
      }
      tapCountRef.current = 0;
    }, 250);

    // Handle double-tap  immediately on second tap
    if (tapCountRef.current === 2) {
      if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
      tapCountRef.current = 0;

      if (relX < 0.35) {
        // Double-tap left: rewind 10s
        skipBack();
        setDoubleTapSide('left');
        setTimeout(() => setDoubleTapSide(null), 600);
      } else if (relX > 0.65) {
        // Double-tap right: forward 10s
        skipForward();
        setDoubleTapSide('right');
        setTimeout(() => setDoubleTapSide(null), 600);
      } else {
        // Center: toggle play
        togglePlay();
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press on move
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    // Volume gesture (right side vertical swipe)
    if (touchVolumeBase !== null && touchYStart !== null) {
      const deltaY = touchYStart - e.touches[0].clientY;
      const sensitivity = 200; // px for 0→1 range
      const newVol = touchVolumeBase + deltaY / sensitivity;
      changeVolume(newVol);
    }
  };

  const handleTouchEnd = () => {
    // Release long press
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (isLongPress) {
      setIsLongPress(false);
      if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
    }
    setTouchVolumeBase(null);
    setTouchYStart(null);
  };

  // ─── Seek Bar Interaction ─────────────────────────────────
  const handleSeekBarInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const bar = progressRef.current;
    if (!bar || !videoRef.current) return;

    const rect = bar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const time = ratio * (videoRef.current.duration || 0);

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      setIsSeeking(true);
      seek(time);
    } else if (isSeeking) {
      seek(time);
    }
  };

  const handleSeekBarHover = (e: React.MouseEvent) => {
    const bar = progressRef.current;
    if (!bar || !videoRef.current) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSeekPreview({ time: ratio * (videoRef.current.duration || 0), x: e.clientX - rect.left });
  };

  useEffect(() => {
    const handleMouseUp = () => setIsSeeking(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSeeking || !progressRef.current || !videoRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(ratio * (videoRef.current.duration || 0));
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isSeeking, seek]);

  // ─── Computed ─────────────────────────────────────────────
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const currentQualityLabel = currentQuality === -1 ? 'Tự động' : qualityLevels[currentQuality]?.label || 'Tự động';
  const subtitleSizeClass = getSubtitleSizeClass(subtitleSize);

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
      >
        {/* Subtitle tracks */}
        {subtitles.map((sub) => (
          <track
            key={sub.id}
            kind="subtitles"
            label={sub.label}
            srcLang={sub.language}
            src={sub.url}
            default={sub.isDefault}
          />
        ))}
      </video>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Long Press 2x Indicator */}
      {isLongPress && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-bold flex items-center gap-1.5">
          <FastForward className="w-3.5 h-3.5" />
          2x
        </div>
      )}

      {/* Double Tap Ripple (left/right) */}
      {doubleTapSide && (
        <div className={`absolute top-0 bottom-0 ${doubleTapSide === 'left' ? 'left-0 right-1/2' : 'left-1/2 right-0'} z-30 flex items-center justify-center pointer-events-none`}>
          <div className="flex items-center gap-1 text-white text-sm font-bold animate-scale-in">
            {doubleTapSide === 'left' ? <SkipBack className="w-6 h-6" /> : <SkipForward className="w-6 h-6" />}
            <span>10s</span>
          </div>
        </div>
      )}

      {/* Subtitle Overlay */}
      {currentSubtitleText && (
        <div className="absolute bottom-24 sm:bottom-28 left-4 right-4 z-25 flex justify-center pointer-events-none">
          <span className={`${subtitleSizeClass} font-medium text-white text-center px-3 py-1.5 rounded-md max-w-[80%] leading-relaxed ${subtitleBg ? 'bg-black/60 backdrop-blur-sm' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}>
            {currentSubtitleText}
          </span>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          // Only toggle play on direct click (not on controls)
          if (e.target === e.currentTarget) togglePlay();
        }}
      >
        {/* Top gradient + info */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-4 sm:p-6 flex items-start justify-end">
          {/* Playback speed badge */}
          <div className="flex items-center gap-2 shrink-0">
            {playbackSpeed !== 1 && (
              <span className="px-2 py-0.5 bg-red-600/20 rounded text-xs text-red-400 font-bold">
                {playbackSpeed}x
              </span>
            )}
          </div>
        </div>

        {/* Center play button (when paused) */}
        {!isPlaying && !isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/70 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1" />
            </div>
          </div>
        )}

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
            {/* Bar background */}
            <div className="absolute left-0 right-0 h-1 group-hover/seek:h-1.5 bg-white/20 rounded-full transition-all">
              {/* Buffered */}
              <div
                className="absolute left-0 top-0 h-full bg-white/20 rounded-full"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Progress */}
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
            {/* Seek preview tooltip */}
            {seekPreview && (
              <div
                className="absolute bottom-6 -translate-x-1/2 px-2 py-0.5 bg-black/80 rounded text-sm text-white font-medium"
                style={{ left: seekPreview.x }}
              >
                {formatTime(seekPreview.time)}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform p-1">
                {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />}
              </button>

              {/* Prev/Next episode */}
              {hasPrev && onPrevEpisode && (
                <button onClick={onPrevEpisode} className="text-white hover:scale-110 transition-transform p-1 hidden sm:block">
                  <SkipBack className="w-6 h-6" />
                </button>
              )}
              {hasNext && onNextEpisode && (
                <button onClick={onNextEpisode} className="text-white hover:scale-110 transition-transform p-1 hidden sm:block">
                  <SkipForward className="w-6 h-6" />
                </button>
              )}

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white hover:scale-110 transition-transform p-1">
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-full cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, #fff 0%, #fff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>

              {/* Time */}
              <span className="text-white text-base sm:text-lg tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              {/* Mobile episode navigation */}
              <div className="flex items-center gap-1 sm:hidden">
                {hasPrev && onPrevEpisode && (
                  <button onClick={onPrevEpisode} className="text-white p-1">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {hasNext && onNextEpisode && (
                  <button onClick={onNextEpisode} className="text-white p-1">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Subtitle toggle */}
              {subtitles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowSubtitleMenu(!showSubtitleMenu); setShowSpeedMenu(false); setShowQualityMenu(false); setShowSettingsMenu(false); }}
                    className={`text-white p-1 hover:scale-110 transition-transform ${activeSubtitle ? 'text-red-400' : ''}`}
                  >
                    <Subtitles className="w-6 h-6" />
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
                  onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowSubtitleMenu(false); setShowQualityMenu(false); setShowSettingsMenu(false); }}
                  className="px-5 py-2.5 text-white text-base sm:text-lg rounded-md hover:bg-white/10 transition-colors"
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
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => { setShowSettingsMenu(!showSettingsMenu); setShowSubtitleMenu(false); setShowSpeedMenu(false); }}
                    className="px-5 py-2.5 text-white text-base sm:text-lg rounded-md hover:bg-white/10 transition-colors"
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
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click overlay for play/pause (desktop) */}
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
