'use client';

import {
  Play, ArrowLeft, Loader2, Star, MessageCircle, MoreHorizontal,
} from 'lucide-react';
import {
  VideoPlayer, LikeButton, ShareButton, UnlockModal,
  InstagramHeart, MobileBottomSheet, MobileCommentSheet,
} from '@/components/watch';
import type { SubtitleTrack, VideoData, EpisodeData } from '@/components/watch';
import type { VideoCardData } from '@/components/common';

interface MobileWatchViewProps {
  video: VideoData;
  currentEpisode: EpisodeData | null;
  streamSrc: string | null;
  subtitles: SubtitleTrack[];
  // Navigation
  episodeChunks: EpisodeData[][];
  activeTab: number;
  setActiveTab: (tab: number) => void;
  episodeAccessMap: Record<string, boolean>;
  playEpisode: (ep: EpisodeData) => void;
  hasPrev: boolean;
  hasNext: boolean;
  nextEpisode: () => void;
  prevEpisode: () => void;
  handleProgress: (currentTime: number, duration: number) => void;
  // Controls
  controlsVisible: boolean;
  handleSingleTap: () => void;
  showInfoPanel: boolean;
  setShowInfoPanel: (v: boolean) => void;
  infoTab: 'info' | 'episodes';
  openInfoPanel: (tab: 'info' | 'episodes') => void;
  showComments: boolean;
  setShowComments: (v: boolean) => void;
  // Unlock
  showUnlockModal: boolean;
  lockedEpisodeId: string | null;
  pendingEpisode: EpisodeData | null;
  handleUnlockSuccess: () => void;
  closeUnlockModal: () => void;
  // Router
  onBack: () => void;
}

export function MobileWatchView({
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
  controlsVisible,
  handleSingleTap,
  showInfoPanel,
  setShowInfoPanel,
  infoTab,
  openInfoPanel,
  showComments,
  setShowComments,
  showUnlockModal,
  lockedEpisodeId,
  pendingEpisode,
  handleUnlockSuccess,
  closeUnlockModal,
  onBack,
}: MobileWatchViewProps) {
  return (
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
            <VideoPlaceholder
              isProcessing={currentEpisode?.encodingStatus === 'PROCESSING'}
              variant="mobile"
            />
          )}
        </InstagramHeart>

        {/* Top Bar (auto-hide) */}
        <div
          className={`absolute top-0 left-0 right-0 z-50 safe-top p-3 flex items-start justify-between transition-all duration-300 ${
            controlsVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <button
            onClick={onBack}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => openInfoPanel('episodes')}
            className="flex-1 px-3 pt-1 text-left"
          >
            <h1 className="text-white font-bold text-sm line-clamp-1 drop-shadow-lg">
              {video.title}
            </h1>
            <p className="text-gray-400 text-[11px] mt-0.5 drop-shadow underline-offset-2">
              Tập {currentEpisode?.episodeNumber}
              {video.totalEpisodes ? ` / ${video.totalEpisodes}` : ''} ▸
            </p>
          </button>
          <button
            onClick={() => openInfoPanel('info')}
            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Social Buttons (auto-hide) */}
        <div
          className={`absolute right-2.5 bottom-24 flex flex-col items-center gap-5 z-30 transition-all duration-300 ${
            controlsVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
        >
          <LikeButton videoId={video.id} likeCount={video.likeCount || 0} />
          <button
            onClick={() => setShowComments(true)}
            className="flex flex-col items-center gap-1"
          >
            <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white/70">
              {video.ratingCount || 0}
            </span>
          </button>
          <button
            onClick={() => openInfoPanel('info')}
            className="flex flex-col items-center gap-1"
          >
            <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-[10px] font-bold text-yellow-400">
              {(video.ratingAverage || 0).toFixed(1)}
            </span>
          </button>
          <ShareButton title={video.title} slug={video.slug} />
        </div>
      </div>

      {/* Mobile Overlays */}
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

      <MobileCommentSheet
        videoId={video.id}
        commentCount={video.ratingCount || 0}
        show={showComments}
        onClose={() => setShowComments(false)}
      />

      {showUnlockModal && lockedEpisodeId && (
        <UnlockModal
          episodeId={lockedEpisodeId}
          episodeNumber={pendingEpisode?.episodeNumber ?? 1}
          videoTitle={video.title}
          onClose={closeUnlockModal}
          onUnlocked={handleUnlockSuccess}
        />
      )}
    </div>
  );
}

// ─── Shared Placeholder ─────────────────────────────────────

interface VideoPlaceholderProps {
  isProcessing: boolean;
  variant: 'mobile' | 'desktop';
}

export function VideoPlaceholder({ isProcessing, variant }: VideoPlaceholderProps) {
  const isMobile = variant === 'mobile';
  const iconSize = isMobile ? 'w-8 h-8' : 'w-10 h-10';
  const containerSize = isMobile ? 'w-16 h-16 mb-4' : 'w-20 h-20 mb-6';
  const titleSize = isMobile ? 'text-lg' : 'text-2xl';
  const textSize = isMobile ? 'text-sm' : 'text-base';

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-10 text-center">
      <div
        className={`${containerSize} bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center`}
      >
        {isProcessing ? (
          <Loader2 className={`${iconSize} text-gray-500 animate-spin`} />
        ) : (
          <Play className={`${iconSize} text-gray-500`} />
        )}
      </div>
      <h3 className={`text-white ${titleSize} font-bold mb-2`}>
        {isProcessing ? 'Đang mã hóa...' : variant === 'desktop' ? 'Tập phim chưa sẵn sàng' : 'Chưa sẵn sàng'}
      </h3>
      <p className={`text-gray-500 ${textSize}`}>
        {variant === 'desktop'
          ? 'Vui lòng quay lại sau ít phút hoặc thử tập phim khác.'
          : 'Vui lòng thử tập khác'}
      </p>
    </div>
  );
}
