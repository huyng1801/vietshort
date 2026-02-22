'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { PLAYER_SETTINGS } from '@/lib/constants';
import { QualityLevel, VideoPlayerProps } from './VideoPlayerTypes';
import { parseSrt, findActiveCue, SubtitleCue } from './VideoPlayerUtils';

// ─── Hook Return Type ───────────────────────────────────────
export interface VideoPlayerState {
  // Refs for the component to attach
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  progressRef: React.RefObject<HTMLDivElement | null>;
  volumeSliderRef: React.RefObject<HTMLDivElement | null>;
  isDraggingVolumeRef: React.MutableRefObject<boolean>;

  // Playback state
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: number;
  isFullscreen: boolean;
  showControls: boolean;
  isLoading: boolean;
  playbackSpeed: number;

  // Menu state
  showSpeedMenu: boolean;
  showQualityMenu: boolean;
  showSubtitleMenu: boolean;
  showSettingsMenu: boolean;
  showVolumePopup: boolean;
  setShowSpeedMenu: (v: boolean) => void;
  setShowQualityMenu: (v: boolean) => void;
  setShowSubtitleMenu: (v: boolean) => void;
  setShowSettingsMenu: (v: boolean) => void;
  setShowVolumePopup: React.Dispatch<React.SetStateAction<boolean>>;

  // Quality
  qualityLevels: QualityLevel[];
  currentQuality: number;
  currentQualityLabel: string;

  // Subtitle
  activeSubtitle: string | null;
  setActiveSubtitle: (id: string | null) => void;
  subtitleSize: 'small' | 'medium' | 'large';
  setSubtitleSize: (v: 'small' | 'medium' | 'large') => void;
  subtitleBg: boolean;
  setSubtitleBg: (v: boolean) => void;
  currentSubtitleText: string;

  // Seek preview
  seekPreview: { time: number; x: number } | null;
  setSeekPreview: (v: { time: number; x: number } | null) => void;

  // Gestures
  doubleTapSide: 'left' | 'right' | null;
  isLongPress: boolean;
  isSeeking: boolean;
  setIsSeeking: (v: boolean) => void;

  // Computed
  progressPercent: number;
  bufferedPercent: number;

  // Actions
  togglePlay: () => void;
  toggleMute: () => void;
  changeVolume: (val: number) => void;
  seek: (time: number) => void;
  skipForward: () => void;
  skipBack: () => void;
  changeSpeed: (speed: number) => void;
  changeQuality: (level: number) => void;
  toggleFullscreen: () => void;
  showControlsTemporarily: () => void;

  // Touch handlers (for the video element)
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;

  // Seek bar handlers
  handleSeekBarInteraction: (e: React.MouseEvent | React.TouchEvent) => void;
  handleSeekBarHover: (e: React.MouseEvent) => void;
}

// ─── Main Hook ──────────────────────────────────────────────
export function useVideoPlayer({
  src,
  subtitles = [],
  onEnded,
  onProgress,
  autoPlay = true,
  initialTime = 0,
}: Pick<
  VideoPlayerProps,
  'src' | 'subtitles' | 'onEnded' | 'onProgress' | 'autoPlay' | 'initialTime'
>): VideoPlayerState {
  // ── Refs ──────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);
  const subtitleCuesRef = useRef<SubtitleCue[]>([]);
  const mountedRef = useRef(true);
  const playbackSpeedRef = useRef(1);
  const isDraggingVolumeRef = useRef(false);

  // Keep callback refs to avoid re-subscribing effects
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  // ── State ─────────────────────────────────────────────────
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
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
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

  // ── Aggressive cleanup helper ─────────────────────────────
  const destroyPlayer = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      try {
        video.muted = true;
        video.pause();
        video.removeAttribute('src');
        while (video.firstChild) video.removeChild(video.firstChild);
      } catch {}
    }
    if (hlsRef.current) {
      try {
        hlsRef.current.stopLoad();
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }
    if (video) {
      try { video.load(); } catch {}
    }
  }, []);

  // Track mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      destroyPlayer();
    };
  }, [destroyPlayer]);

  // ── HLS Setup ─────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    destroyPlayer();

    const setupTimer = setTimeout(() => {
      if (!mountedRef.current) return;

      // Reset muted state — destroyPlayer() sets video.muted=true,
      // we must restore it before playing the new source.
      video.muted = false;
      video.volume = 1;

      if (src.includes('.m3u8') && Hls.isSupported()) {
        const hls = new Hls({
          startLevel: -1,
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          if (!mountedRef.current) return;
          const levels = data.levels.map((l) => ({
            height: l.height,
            bitrate: l.bitrate,
            label: `${l.height}p`,
          }));
          setQualityLevels(levels);
          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          if (mountedRef.current) setCurrentQuality(data.level);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!mountedRef.current) return;
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('[HLS] Network error, retrying…');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('[HLS] Media error, recovering…');
                hls.recoverMediaError();
                break;
              default:
                console.error('[HLS] Fatal error, destroying…');
                destroyPlayer();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        if (autoPlay) video.play().catch(() => {});
      } else {
        video.src = src;
        if (autoPlay) video.play().catch(() => {});
      }
    }, 50);

    return () => {
      clearTimeout(setupTimer);
      destroyPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // ── Cleanup on page hide / navigation ─────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        const video = videoRef.current;
        if (video && !video.paused) video.pause();
      }
    };
    const handleBeforeUnload = () => destroyPlayer();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [destroyPlayer]);

  // ── Set initial time ──────────────────────────────────────
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

  // ── Video Event Listeners ─────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { if (mountedRef.current) setIsPlaying(true); };
    const onPause = () => { if (mountedRef.current) setIsPlaying(false); };
    const onWaiting = () => { if (mountedRef.current) setIsLoading(true); };
    const onCanPlay = () => { if (mountedRef.current) setIsLoading(false); };
    const onTimeUpdate = () => {
      if (!mountedRef.current) return;
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => {
      if (mountedRef.current) setDuration(video.duration);
    };
    const onEnd = () => {
      if (!mountedRef.current) return;
      setIsPlaying(false);
      onEndedRef.current?.();
    };
    const onVolumeChange = () => {
      if (!mountedRef.current) return;
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
      try {
        video.muted = true;
        video.pause();
      } catch {}
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Report progress ───────────────────────────────────────
  useEffect(() => {
    progressTimerRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && onProgressRef.current) {
        onProgressRef.current(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, PLAYER_SETTINGS.PROGRESS_SAVE_INTERVAL);
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Subtitle Loading ──────────────────────────────────────
  useEffect(() => {
    if (subtitles.length > 0 && !activeSubtitle) {
      const defaultSub = subtitles.find(s => s.isDefault) ?? subtitles[0];
      setActiveSubtitle(defaultSub.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitles]);

  useEffect(() => {
    subtitleCuesRef.current = [];
    setCurrentSubtitleText('');
    if (!activeSubtitle) return;

    const activeSub = subtitles.find(s => s.id === activeSubtitle);
    if (!activeSub) return;

    const inlineContent = activeSub.content?.trim();
    if (inlineContent) {
      const cues = parseSrt(inlineContent);
      if (cues.length > 0) {
        subtitleCuesRef.current = cues;
        return;
      }
    }

    const url = activeSub.url?.trim();
    if (url) {
      let cancelled = false;
      fetch(url)
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.text(); })
        .then(srtText => { if (!cancelled) subtitleCuesRef.current = parseSrt(srtText); })
        .catch(err => console.error('[Subtitle] Failed to fetch:', url, err));
      return () => { cancelled = true; };
    }
  }, [activeSubtitle, subtitles]);

  useEffect(() => {
    if (!activeSubtitle || subtitleCuesRef.current.length === 0) {
      if (currentSubtitleText) setCurrentSubtitleText('');
      return;
    }
    const text = findActiveCue(subtitleCuesRef.current, currentTime);
    if (text !== currentSubtitleText) setCurrentSubtitleText(text);
  }, [currentTime, activeSubtitle]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Controls Visibility ───────────────────────────────────
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying && !showSpeedMenu && !showQualityMenu && !showSubtitleMenu && !showSettingsMenu && !showVolumePopup) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, showSpeedMenu, showQualityMenu, showSubtitleMenu, showSettingsMenu, showVolumePopup]);

  useEffect(() => {
    if (isPlaying) showControlsTemporarily();
    else setShowControls(true);
  }, [isPlaying, showControlsTemporarily]);

  // ── Playback Controls ─────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.src) return;
    if (video.paused) {
      video.play().catch(err => console.error('[Player] play() failed:', err));
    } else {
      video.pause();
      if (!video.paused) {
        video.muted = true;
        requestAnimationFrame(() => { if (video.paused) video.muted = isMuted; });
      }
    }
    showControlsTemporarily();
  }, [showControlsTemporarily, isMuted]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const changeVolume = useCallback((val: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, val));
    video.volume = clamped;
    if (clamped > 0 && video.muted) video.muted = false;
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
    playbackSpeedRef.current = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    setShowSettingsMenu(false);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const changeQuality = useCallback((level: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = level;
    setCurrentQuality(level);
    setShowQualityMenu(false);
    setShowSettingsMenu(false);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // ── Fullscreen ────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
        try { await (screen.orientation as any)?.lock?.('landscape'); } catch {}
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        try { (screen.orientation as any)?.unlock?.(); } catch {}
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Keyboard Controls ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) && !isFullscreen) return;
      switch (e.key) {
        case ' ':
        case 'k': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); skipBack(); break;
        case 'ArrowRight': e.preventDefault(); skipForward(); break;
        case 'ArrowUp': e.preventDefault(); changeVolume(volume + 0.1); break;
        case 'ArrowDown': e.preventDefault(); changeVolume(volume - 0.1); break;
        case 'm': e.preventDefault(); toggleMute(); break;
        case 'f': e.preventDefault(); toggleFullscreen(); break;
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

  // ── Touch & Gesture Handling ──────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relX = (touch.clientX - rect.left) / rect.width;
    const relY = touch.clientY;

    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      if (videoRef.current) videoRef.current.playbackRate = 2;
    }, 500);

    if (relX > 0.7) {
      setTouchVolumeBase(volume);
      setTouchYStart(relY);
    }

    tapCountRef.current += 1;
    if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
    doubleTapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current === 1) {
        if (showControls) setShowControls(false);
        else showControlsTemporarily();
      }
      tapCountRef.current = 0;
    }, 250);

    if (tapCountRef.current === 2) {
      if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
      tapCountRef.current = 0;
      if (relX < 0.35) {
        skipBack();
        setDoubleTapSide('left');
        setTimeout(() => setDoubleTapSide(null), 600);
      } else if (relX > 0.65) {
        skipForward();
        setDoubleTapSide('right');
        setTimeout(() => setDoubleTapSide(null), 600);
      } else {
        togglePlay();
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (touchVolumeBase !== null && touchYStart !== null) {
      const deltaY = touchYStart - e.touches[0].clientY;
      const sensitivity = 200;
      changeVolume(touchVolumeBase + deltaY / sensitivity);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (isLongPress) {
      setIsLongPress(false);
      if (videoRef.current) videoRef.current.playbackRate = playbackSpeedRef.current;
    }
    setTouchVolumeBase(null);
    setTouchYStart(null);
  };

  // ── Seek Bar ──────────────────────────────────────────────
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

  // Global mouse/touch for seek + volume drag
  useEffect(() => {
    const handleMouseUp = () => {
      setIsSeeking(false);
      isDraggingVolumeRef.current = false;
    };
    const handleTouchEndGlobal = () => {
      isDraggingVolumeRef.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isSeeking && progressRef.current && videoRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        seek(ratio * (videoRef.current.duration || 0));
      }
      if (isDraggingVolumeRef.current && volumeSliderRef.current) {
        const rect = volumeSliderRef.current.getBoundingClientRect();
        const ratio = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        changeVolume(ratio);
      }
    };
    const handleTouchMoveGlobal = (e: TouchEvent) => {
      if (isDraggingVolumeRef.current && volumeSliderRef.current) {
        e.preventDefault();
        const rect = volumeSliderRef.current.getBoundingClientRect();
        const ratio = 1 - Math.max(0, Math.min(1, (e.touches[0].clientY - rect.top) / rect.height));
        changeVolume(ratio);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleTouchEndGlobal);
    window.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEndGlobal);
      window.removeEventListener('touchmove', handleTouchMoveGlobal);
    };
  }, [isSeeking, seek, changeVolume]);

  // ── Computed ──────────────────────────────────────────────
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const currentQualityLabel = currentQuality === -1
    ? 'Tự động'
    : qualityLevels[currentQuality]?.label || 'Tự động';

  return {
    videoRef,
    containerRef,
    progressRef,
    volumeSliderRef,
    isDraggingVolumeRef,

    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    buffered,
    isFullscreen,
    showControls,
    isLoading,
    playbackSpeed,

    showSpeedMenu,
    showQualityMenu,
    showSubtitleMenu,
    showSettingsMenu,
    showVolumePopup,
    setShowSpeedMenu,
    setShowQualityMenu,
    setShowSubtitleMenu,
    setShowSettingsMenu,
    setShowVolumePopup,

    qualityLevels,
    currentQuality,
    currentQualityLabel,

    activeSubtitle,
    setActiveSubtitle,
    subtitleSize,
    setSubtitleSize,
    subtitleBg,
    setSubtitleBg,
    currentSubtitleText,

    seekPreview,
    setSeekPreview,

    doubleTapSide,
    isLongPress,
    isSeeking,
    setIsSeeking,

    progressPercent,
    bufferedPercent,

    togglePlay,
    toggleMute,
    changeVolume,
    seek,
    skipForward,
    skipBack,
    changeSpeed,
    changeQuality,
    toggleFullscreen,
    showControlsTemporarily,

    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSeekBarInteraction,
    handleSeekBarHover,
  };
}
