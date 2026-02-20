'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Play, Lock, ArrowLeft, Eye, Calendar,
  Film, Crown, Loader2
} from 'lucide-react';
import { videoApi, recommendApi, unlockApi } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { VideoPlayer, SubtitleTrack } from '@/components/video/VideoPlayer';
import { LikeButton, BookmarkButton } from '@/components/video/LikeButton';
import { RatingStars } from '@/components/video/RatingStars';
import { ShareButton } from '@/components/video/ShareButton';
import { CommentSection } from '@/components/video/CommentSection';
import { VideoCardData } from '@/components/video/VideoCard';
import { UnlockModal } from '@/components/payment/UnlockModal';
import { recordWatchActivity } from '@/components/gamification/RetentionWidgets';
import { dailyTasksApi } from '@/lib/api';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────
interface VideoData {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  slug: string;
  genres?: string;
  releaseYear?: number;
  director?: string;
  actors?: string;
  isSerial: boolean;
  totalEpisodes?: number;
  viewCount?: number;
  likeCount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  isVipOnly?: boolean;
  episodes: EpisodeData[];
}

interface EpisodeData {
  id: string;
  episodeNumber: number;
  title?: string;
  hlsManifest?: string;
  duration?: number;
  encodingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  subtitles?: SubtitleTrack[];
}

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const epParam = searchParams.get('ep');

  const [video, setVideo] = useState<VideoData | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [similarVideos, setSimilarVideos] = useState<VideoCardData[]>([]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [lockedEpisodeId, setLockedEpisodeId] = useState<string | null>(null);
  const [pendingEpisode, setPendingEpisode] = useState<EpisodeData | null>(null);
  const [episodeAccessMap, setEpisodeAccessMap] = useState<Record<string, boolean>>({});

  // ─── Fetch Video ──────────────────────────────────────────
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await videoApi.bySlug(slug);
        setVideo(videoData);

        // Set episode
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

        // Increment view & track watch activity
        try { await videoApi.incrementView(videoData.id); } catch {}
        try { recordWatchActivity(); dailyTasksApi.trackWatch().catch(() => {}); } catch {}

        // Load similar videos
        try {
          const similar = await recommendApi.similar(videoData.id, 8);
          setSimilarVideos(similar || []);
        } catch {}

        // Check access for all episodes
        if (videoData.episodes && videoData.episodes.length > 0) {
          const accessMap: Record<string, boolean> = {};
          await Promise.all(
            videoData.episodes.map(async (ep: EpisodeData) => {
              try {
                const access = await unlockApi.checkAccess(ep.id);
                accessMap[ep.id] = access.hasAccess;
              } catch {
                // If check fails, assume has access
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
    // Check access before playing (gold/VIP lock)
    try {
      const access = await unlockApi.checkAccess(episode.id);
      if (!access.hasAccess) {
        setLockedEpisodeId(episode.id);
        setPendingEpisode(episode);
        setShowUnlockModal(true);
        return;
      }
    } catch {
      // If check fails, let them try to play anyway
    }
    setCurrentEpisode(episode);
    router.replace(`/watch/${slug}?ep=${episode.episodeNumber}`, { scroll: false });
  }, [slug, router]);

  const handleUnlockSuccess = useCallback(() => {
    setShowUnlockModal(false);
    if (pendingEpisode) {
      setCurrentEpisode(pendingEpisode);
      router.replace(`/watch/${slug}?ep=${pendingEpisode.episodeNumber}`, { scroll: false });
      setPendingEpisode(null);
      // Update access map
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

  // ─── Subtitles ────────────────────────────────────────────
  const subtitles: SubtitleTrack[] = useMemo(() => {
    if (!currentEpisode?.subtitles) return [];
    return currentEpisode.subtitles;
  }, [currentEpisode?.subtitles]);

  // ─── Stream URL ───────────────────────────────────────────
  const streamSrc = useMemo(() => {
    if (!currentEpisode?.hlsManifest || currentEpisode.encodingStatus !== 'COMPLETED') return null;
    return currentEpisode.hlsManifest;
  }, [currentEpisode]);

  // ─── Loading / Error ──────────────────────────────────────
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

  return (
    <div className="h-[calc(100vh-56px)] lg:h-[calc(100vh-64px)] mt-14 lg:mt-16 bg-black flex flex-col lg:flex-row overflow-hidden">
      {/* Back button for mobile */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white lg:hidden"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* ─── Left Column: Video Player ─────────────────────── */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        {/* Desktop back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-12 z-50 p-5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white hidden lg:flex items-center justify-center shadow-lg transition-colors"
        >
          <ArrowLeft className="w-8 h-8 text-white" />
        </button>

        <div className="h-full aspect-[9/16] relative bg-black overflow-hidden">
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

      {/* ─── Right Column: Content & Metadata ─────────────── */}
      <div className="w-full lg:w-[450px] xl:w-[500px] bg-[#0a0a0a] border-l border-white/5 flex-shrink-0 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto lg:overflow-hidden custom-scrollbar px-3 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-base uppercase tracking-wider text-gray-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href={`/video/${video.slug}`} className="hover:text-white transition-colors line-clamp-1 max-w-[140px]">{video.title}</Link>
            <span>/</span>
            <span className="text-gray-300 font-medium">Tập {currentEpisode?.episodeNumber}</span>
          </nav>

          {/* Video Title */}
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">
            {video.title}
          </h1>
          <p className="text-gray-400 text-base mb-4">
            Tập {currentEpisode?.episodeNumber}{video.totalEpisodes ? ` / ${video.totalEpisodes}` : ''}
            {currentEpisode?.title && ` - ${currentEpisode.title}`}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-6 text-xl text-gray-500">
            {video.viewCount != null && (
              <span className="flex items-center gap-1"><Eye className="w-5 h-5" /> {formatCount(video.viewCount)} lượt xem</span>
            )}
            {video.releaseYear && (
              <span className="flex items-center gap-1"><Calendar className="w-5 h-5" /> {video.releaseYear}</span>
            )}
            {video.isVipOnly && (
              <span className="flex items-center gap-1 text-yellow-500"><Crown className="w-5 h-5" /> VIP</span>
            )}
          </div>

          {/* Description */}
          {video.description && (
            <div className="mb-6">
              <div className="relative">
                <p className={`text-gray-400 text-lg leading-relaxed ${!descExpanded ? 'line-clamp-2' : ''}`}>
                  {video.description}
                </p>
                {video.description.length > 150 && (
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="mt-1 text-red-500 font-bold hover:text-red-400 text-base"
                  >
                    {descExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tags / Genres */}
          {video.genres && (
            <div className="flex flex-wrap gap-2 mb-6">
              {video.genres.split(',').map((genre, idx) => (
                <span key={idx} className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-lg font-medium text-gray-400 hover:bg-white/10 transition-colors cursor-default">
                  {genre.trim()}
                </span>
              ))}
            </div>
          )}

          {/* ─── Social Interactions ─────────────────────── */}
          {/* Rating Section */}
          <div className="mb-4 py-4 border-t border-white/5 border-b border-white/5">
            <RatingStars
              videoId={video.id}
              averageRating={video.ratingAverage || 0}
              ratingCount={video.ratingCount || 0}
              size="md"
            />
          </div>

          {/* Like, Bookmark, Share Section */}
          <div className="flex items-center justify-around mb-6 py-4 border-b border-white/5">
            <LikeButton videoId={video.id} likeCount={video.likeCount || 0} />
            <BookmarkButton videoId={video.id} />
            <ShareButton videoId={video.id} title={video.title} slug={video.slug} />
          </div>

          {/* ─── Episode Selector ────────────────────────── */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-gray-400" />
                <h3 className="text-white font-bold text-xl">Danh sách tập</h3>
              </div>
              {episodeChunks.length > 1 && (
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                  {episodeChunks.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`relative py-1 text-base font-bold transition-colors whitespace-nowrap ${
                        activeTab === idx ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {idx * 50 + 1}-{Math.min((idx + 1) * 50, video.episodes.length)}
                      {activeTab === idx && <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-red-600 rounded-full" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episode Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-7 gap-2">
              {episodeChunks[activeTab]?.map((episode) => {
                const isActive = currentEpisode?.id === episode.id;
                const isReady = episode.encodingStatus === 'COMPLETED' && episode.hlsManifest;
                const isProcessing = episode.encodingStatus === 'PROCESSING';
                const hasAccess = episodeAccessMap[episode.id] !== false;
                const needsUnlock = isReady && !hasAccess;

                return (
                  <button
                    key={episode.id}
                    onClick={() => (isReady || needsUnlock) && playEpisode(episode)}
                    disabled={!isReady && !needsUnlock}
                    className={`relative aspect-square rounded-md flex py-2 items-center justify-center text-lg font-semibold transition-all ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : needsUnlock
                          ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'
                          : isReady
                            ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'
                            : 'bg-[#111] text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    ) : (
                      episode.episodeNumber
                    )}
                    {needsUnlock && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    {!isReady && !isProcessing && !needsUnlock && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Comments Section ────────────────────────── */}
          <CommentSection videoId={video.id} />

          {/* ─── Unlock Modal ────────────────────────────── */}
          {showUnlockModal && lockedEpisodeId && (
            <UnlockModal
              episodeId={lockedEpisodeId}
              episodeNumber={pendingEpisode?.episodeNumber ?? 1}
              videoTitle={video.title}
              onClose={() => { setShowUnlockModal(false); setPendingEpisode(null); setLockedEpisodeId(null); }}
              onUnlocked={handleUnlockSuccess}
            />
          )}

          {/* ─── Similar Videos ──────────────────────────── */}
          {similarVideos.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                <Film className="w-5 h-5 text-gray-400" />
                Phim tương tự
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {similarVideos.slice(0, 6).map((v) => (
                  <Link
                    key={v.id}
                    href={`/watch/${v.slug || v.id}`}
                    className="group"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5 mb-1.5">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundImage: `url(${v.poster || v.thumbnail || '/images/placeholder.jpg'})` }}
                      />
                    </div>
                    <p className="text-base text-gray-300 font-medium line-clamp-2 group-hover:text-white transition-colors">
                      {v.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Utility ────────────────────────────────────────────────
function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}