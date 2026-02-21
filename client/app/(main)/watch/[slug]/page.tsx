'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Play, ArrowLeft, Loader2, Star, MessageCircle, MoreHorizontal,
} from 'lucide-react';
import { videoApi, recommendApi, unlockApi, subtitleApi } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { VideoPlayer, SubtitleTrack } from '@/components/video/VideoPlayer';
import { LikeButton } from '@/components/video/LikeButton';
import { ShareButton } from '@/components/video/ShareButton';
import { VideoCardData } from '@/components/video/VideoCard';
import { UnlockModal } from '@/components/payment/UnlockModal';
import { recordWatchActivity } from '@/components/gamification/RetentionWidgets';
import { dailyTasksApi } from '@/lib/api';

// ─── Watch Page Components ────────────────────────────────────
import { InstagramHeart } from '@/components/video/watch/InstagramHeart';
import { MobileBottomSheet } from '@/components/video/watch/MobileBottomSheet';
import { MobileCommentSheet } from '@/components/video/watch/MobileCommentSheet';
import { DesktopWatchSidebar } from '@/components/video/watch/DesktopWatchSidebar';
import type { VideoData, EpisodeData } from '@/components/video/watch/types';

// ─── Constants ────────────────────────────────────────────────
const CONTROLS_HIDE_DELAY = 4000;

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const epParam = searchParams.get('ep');

  // ─── Core State ──────────────────────────────────────────
  const [video, setVideo] = useState<VideoData | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [similarVideos, setSimilarVideos] = useState<VideoCardData[]>([]);
  const [episodeAccessMap, setEpisodeAccessMap] = useState<Record<string, boolean>>({});

  // ─── Unlock Modal State ──────────────────────────────────
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [lockedEpisodeId, setLockedEpisodeId] = useState<string | null>(null);
  const [pendingEpisode, setPendingEpisode] = useState<EpisodeData | null>(null);

  // ─── Mobile UI State ─────────────────────────────────────
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [infoTab, setInfoTab] = useState<'info' | 'episodes'>('episodes');
  const [showComments, setShowComments] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Auto-hide Controls Logic ────────────────────────────
  const resetControlsTimer = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setControlsVisible(true);
    controlsTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  useEffect(() => {
    if (showInfoPanel || showComments) {
      setControlsVisible(true);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    } else {
      resetControlsTimer();
    }
  }, [showInfoPanel, showComments, resetControlsTimer]);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const handleSingleTap = useCallback(() => {
    if (controlsVisible) {
      setControlsVisible(false);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    } else {
      resetControlsTimer();
    }
  }, [controlsVisible, resetControlsTimer]);

  // ─── Fetch Video ──────────────────────────────────────────
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await videoApi.bySlug(slug);
        setVideo(videoData);

        let targetEp = null;
        if (epParam) {
          targetEp = videoData.episodes?.find((ep: EpisodeData) => ep.episodeNumber === parseInt(epParam));
        }
        if (!targetEp) {
          const completed = videoData.episodes?.filter((ep: EpisodeData) =>
            ep.encodingStatus === 'COMPLETED' && ep.hlsManifest
          ) || [];
          targetEp = completed.length > 0 ? completed[0] : videoData.episodes?.[0];
        }
        setCurrentEpisode(targetEp || null);

        try { await videoApi.incrementView(videoData.id); } catch {}
        try { recordWatchActivity(); dailyTasksApi.trackWatch().catch(() => {}); } catch {}

        try {
          const similar = await recommendApi.similar(videoData.id, 8);
          setSimilarVideos(similar || []);
        } catch {}

        if (videoData.episodes && videoData.episodes.length > 0) {
          const accessMap: Record<string, boolean> = {};
          await Promise.all(
            videoData.episodes.map(async (ep: EpisodeData) => {
              try {
                const access = await unlockApi.checkAccess(ep.id);
                accessMap[ep.id] = access.hasAccess;
              } catch {
                accessMap[ep.id] = true;
              }
            })
          );
          setEpisodeAccessMap(accessMap);
        }
      } catch (err) {
        console.error('Failed to fetch video:', err);
        setError('Không thể tải video. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchVideo();
  }, [slug, epParam]);

  // ─── Episode Chunks ───────────────────────────────────────
  const episodeChunks = useMemo(() => {
    if (!video?.episodes) return [];
    const chunks = [];
    for (let i = 0; i < video.episodes.length; i += 50) {
      chunks.push(video.episodes.slice(i, i + 50));
    }
    return chunks;
  }, [video?.episodes]);

  useEffect(() => {
    if (currentEpisode) {
      const index = video?.episodes?.findIndex(ep => ep.id === currentEpisode.id) || 0;
      setActiveTab(Math.floor(index / 50));
    }
  }, [currentEpisode, video?.episodes]);

  // ─── Episode Navigation ───────────────────────────────────
  const currentIndex = useMemo(() => {
    if (!video?.episodes || !currentEpisode) return -1;
    return video.episodes.findIndex(ep => ep.id === currentEpisode.id);
  }, [video?.episodes, currentEpisode]);

  const hasPrev = currentIndex > 0;
  const hasNext = video?.episodes ? currentIndex < video.episodes.length - 1 : false;

  const playEpisode = useCallback(async (episode: EpisodeData) => {
    try {
      const access = await unlockApi.checkAccess(episode.id);
      if (!access.hasAccess) {
        setLockedEpisodeId(episode.id);
        setPendingEpisode(episode);
        setShowUnlockModal(true);
        return;
      }
    } catch {}
    setCurrentEpisode(episode);
    router.replace(`/watch/${slug}?ep=${episode.episodeNumber}`, { scroll: false });
  }, [slug, router]);

  const handleUnlockSuccess = useCallback(() => {
    setShowUnlockModal(false);
    if (pendingEpisode) {
      setCurrentEpisode(pendingEpisode);
      router.replace(`/watch/${slug}?ep=${pendingEpisode.episodeNumber}`, { scroll: false });
      setPendingEpisode(null);
      if (lockedEpisodeId) {
        setEpisodeAccessMap(prev => ({ ...prev, [lockedEpisodeId]: true }));
      }
    }
    setLockedEpisodeId(null);
  }, [pendingEpisode, slug, router, lockedEpisodeId]);

  const nextEpisode = useCallback(() => {
    if (!video?.episodes || !hasNext) return;
    playEpisode(video.episodes[currentIndex + 1]);
  }, [video?.episodes, currentIndex, hasNext, playEpisode]);

  const prevEpisode = useCallback(() => {
    if (!video?.episodes || !hasPrev) return;
    playEpisode(video.episodes[currentIndex - 1]);
  }, [video?.episodes, currentIndex, hasPrev, playEpisode]);

  // ─── Progress Reporting ───────────────────────────────────
  const handleProgress = useCallback((currentTime: number, duration: number) => {
    if (!video?.id || !currentEpisode?.id) return;
    videoApi.updateProgress(video.id, {
      episodeId: currentEpisode.id,
      progressive: duration > 0 ? currentTime / duration : 0,
    }).catch(() => {});
  }, [video?.id, currentEpisode?.id]);

  // ─── Subtitles & Stream ───────────────────────────────────
  const [episodeSubtitles, setEpisodeSubtitles] = useState<any[]>([]);

  useEffect(() => {
    if (!currentEpisode?.id) {
      setEpisodeSubtitles([]);
      return;
    }
    setEpisodeSubtitles([]);
    subtitleApi.byEpisode(currentEpisode.id)
      .then(data => {
        console.log('[WatchPage] Fetched subtitles for episode', currentEpisode.id, ':', data?.length ?? 0, data);
        setEpisodeSubtitles(data || []);
      })
      .catch(err => {
        console.error('[WatchPage] Failed to fetch subtitles:', err);
      });
  }, [currentEpisode?.id]);

  const subtitles: SubtitleTrack[] = useMemo(() => {
    return episodeSubtitles
      .filter((sub: any) => sub.status === 'COMPLETED')
      .map((sub: any, idx: number) => ({
        id: sub.id,
        label: sub.label || sub.language || 'Unknown',
        language: sub.language,
        url: sub.srtUrl || '',
        content: sub.content || '',
        isDefault: idx === 0,
      }));
  }, [episodeSubtitles]);

  const streamSrc = useMemo(() => {
    if (!currentEpisode?.hlsManifest || currentEpisode.encodingStatus !== 'COMPLETED') return null;
    return currentEpisode.hlsManifest;
  }, [currentEpisode]);

  // ─── Loading / Error States ───────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loading size="xl" text="Đang tải video..." />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Lỗi</h1>
          <p className="text-gray-400 mb-6">{error || 'Video không tồn tại'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          MOBILE / TABLET (TikTok-style full screen)
          ═══════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed inset-0 bg-black z-50 flex flex-col">
        {/* Video Player - Full Screen */}
        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
          <InstagramHeart onSingleTap={handleSingleTap}>
            {streamSrc ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-full w-full max-w-[100vh*9/16] aspect-[9/16] relative">
                  <VideoPlayer
                    key={currentEpisode?.id}
                    src={streamSrc}
                    poster={video.poster}
                    title={video.title}
                    episodeNumber={currentEpisode?.episodeNumber}
                    subtitles={subtitles}
                    onEnded={nextEpisode}
                    onPrevEpisode={prevEpisode}
                    onNextEpisode={nextEpisode}
                    onProgress={handleProgress}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    autoPlay
                    initialTime={0}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center px-10 text-center">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center mb-4">
                  {currentEpisode?.encodingStatus === 'PROCESSING' ? (
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                  ) : (
                    <Play className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <h3 className="text-white text-lg font-bold mb-2">
                  {currentEpisode?.encodingStatus === 'PROCESSING' ? 'Đang mã hóa...' : 'Chưa sẵn sàng'}
                </h3>
                <p className="text-gray-500 text-sm">Vui lòng thử tập khác</p>
              </div>
            )}
          </InstagramHeart>

          {/* Top Bar (auto-hide) */}
          <div className={`absolute top-0 left-0 right-0 z-50 safe-top p-3 flex items-start justify-between transition-all duration-300 ${
            controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}>
            <button
              onClick={() => router.back()}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setShowInfoPanel(true); setInfoTab('episodes'); }}
              className="flex-1 px-3 pt-1 text-left"
            >
              <h1 className="text-white font-bold text-sm line-clamp-1 drop-shadow-lg">{video.title}</h1>
              <p className="text-gray-400 text-[11px] mt-0.5 drop-shadow underline-offset-2">
                Tập {currentEpisode?.episodeNumber}{video.totalEpisodes ? ` / ${video.totalEpisodes}` : ''} ▸
              </p>
            </button>
            <button
              onClick={() => { setShowInfoPanel(true); setInfoTab('info'); }}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Social Buttons (auto-hide) */}
          <div className={`absolute right-2.5 bottom-24 flex flex-col items-center gap-5 z-30 transition-all duration-300 ${
            controlsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
          }`}>
            <LikeButton videoId={video.id} likeCount={video.likeCount || 0} />
            <button
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center gap-1"
            >
              <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold text-white/70">{video.ratingCount || 0}</span>
            </button>
            <button
              onClick={() => { setShowInfoPanel(true); setInfoTab('info'); }}
              className="flex flex-col items-center gap-1"
            >
              <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-[10px] font-bold text-yellow-400">{(video.ratingAverage || 0).toFixed(1)}</span>
            </button>
            <ShareButton videoId={video.id} title={video.title} slug={video.slug} />
          </div>
        </div>



        {/* Mobile Overlays */}
        {/* Bottom Sheet (Info/Episodes) */}
        <MobileBottomSheet
          video={video}
          currentEpisode={currentEpisode}
          episodeChunks={episodeChunks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          episodeAccessMap={episodeAccessMap}
          playEpisode={playEpisode}
          show={showInfoPanel}
          onClose={() => setShowInfoPanel(false)}
          initialTab={infoTab}
        />

        {/* Comment Sheet */}
        <MobileCommentSheet
          videoId={video.id}
          commentCount={video.ratingCount || 0}
          show={showComments}
          onClose={() => setShowComments(false)}
        />

        {/* Unlock Modal */}
        {showUnlockModal && lockedEpisodeId && (
          <UnlockModal
            episodeId={lockedEpisodeId}
            episodeNumber={pendingEpisode?.episodeNumber ?? 1}
            videoTitle={video.title}
            onClose={() => { setShowUnlockModal(false); setPendingEpisode(null); setLockedEpisodeId(null); }}
            onUnlocked={handleUnlockSuccess}
          />
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP LAYOUT (lg and above)
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-[calc(100vh-60px)] bg-black flex-row overflow-hidden">
        {/* Left: Video Player */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-10 z-50 p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white flex items-center justify-center shadow-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div className="h-[calc(100vh-60px)] aspect-[9/16] relative bg-black overflow-hidden">
            {streamSrc ? (
              <VideoPlayer
                key={currentEpisode?.id}
                src={streamSrc}
                poster={video.poster}
                title={video.title}
                episodeNumber={currentEpisode?.episodeNumber}
                subtitles={subtitles}
                onEnded={nextEpisode}
                onPrevEpisode={prevEpisode}
                onNextEpisode={nextEpisode}
                onProgress={handleProgress}
                hasPrev={hasPrev}
                hasNext={hasNext}
                autoPlay
                initialTime={0}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center px-10 text-center">
                <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center mb-6">
                  {currentEpisode?.encodingStatus === 'PROCESSING' ? (
                    <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
                  ) : (
                    <Play className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">
                  {currentEpisode?.encodingStatus === 'PROCESSING' ? 'Đang mã hóa tập phim...' : 'Tập phim chưa sẵn sàng'}
                </h3>
                <p className="text-gray-500 text-base">Vui lòng quay lại sau ít phút hoặc thử tập phim khác.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <DesktopWatchSidebar
          video={video}
          currentEpisode={currentEpisode}
          episodeChunks={episodeChunks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          episodeAccessMap={episodeAccessMap}
          playEpisode={playEpisode}
          similarVideos={similarVideos}
        />

        {/* Desktop Unlock Modal */}
        {showUnlockModal && lockedEpisodeId && (
          <UnlockModal
            episodeId={lockedEpisodeId}
            episodeNumber={pendingEpisode?.episodeNumber ?? 1}
            videoTitle={video.title}
            onClose={() => { setShowUnlockModal(false); setPendingEpisode(null); setLockedEpisodeId(null); }}
            onUnlocked={handleUnlockSuccess}
          />
        )}
      </div>
    </>
  );
}
