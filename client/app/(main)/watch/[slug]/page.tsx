'use client';

import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loading } from '@/components/common';
import { MobileWatchView, DesktopWatchView } from '@/components/watch';
import { useWatchVideo } from '@/hooks/useWatchVideo';
import { useEpisodeNavigation } from '@/hooks/useEpisodeNavigation';
import { useMobileControls } from '@/hooks/useMobileControls';
import { useEpisodeStream } from '@/hooks/useEpisodeStream';

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><Loading size="xl" text="Đang tải video..." /></div>}>
      <WatchPageContent />
    </Suspense>
  );
}

function WatchPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const epParam = searchParams.get('ep');

  // ─── Data Fetching ────────────────────────────────────────
  const {
    video, currentEpisode, setCurrentEpisode,
    loading, error, similarVideos,
    episodeAccessMap, setEpisodeAccessMap,
  } = useWatchVideo(slug, epParam);

  // ─── Episode Navigation & Unlock ─────────────────────────
  const {
    episodeChunks, activeTab, setActiveTab,
    hasPrev, hasNext, playEpisode, nextEpisode, prevEpisode,
    showUnlockModal, lockedEpisodeId, pendingEpisode,
    handleUnlockSuccess, closeUnlockModal,
  } = useEpisodeNavigation({
    video, currentEpisode, setCurrentEpisode, slug,
    episodeAccessMap, setEpisodeAccessMap,
  });

  // ─── Mobile Controls ─────────────────────────────────────
  const mobileControls = useMobileControls();

  // ─── Stream & Subtitles ──────────────────────────────────
  const { subtitles, streamSrc, handleProgress } = useEpisodeStream(
    currentEpisode,
    video?.id,
  );

  // ─── Loading / Error States ──────────────────────────────
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

  const sharedProps = {
    video,
    currentEpisode,
    streamSrc,
    subtitles,
    episodeChunks,
    activeTab,
    setActiveTab,
    episodeAccessMap,
    playEpisode,
    hasPrev,
    hasNext,
    nextEpisode,
    prevEpisode,
    handleProgress,
    showUnlockModal,
    lockedEpisodeId,
    pendingEpisode,
    handleUnlockSuccess,
    closeUnlockModal,
    onBack: () => router.back(),
  };

  return (
    <>
      <MobileWatchView
        {...sharedProps}
        {...mobileControls}
      />
      <DesktopWatchView
        {...sharedProps}
        similarVideos={similarVideos}
      />
    </>
  );
}
