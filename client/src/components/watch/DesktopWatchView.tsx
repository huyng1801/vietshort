'use client';

import { ArrowLeft } from 'lucide-react';
import {
  VideoPlayer, UnlockModal, DesktopWatchSidebar,
} from '@/components/watch';
import { VideoPlaceholder } from './MobileWatchView';
import type { SubtitleTrack, VideoData, EpisodeData } from '@/components/watch';
import type { VideoCardData } from '@/components/common';

interface DesktopWatchViewProps {
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
  similarVideos: VideoCardData[];
  // Unlock
  showUnlockModal: boolean;
  lockedEpisodeId: string | null;
  pendingEpisode: EpisodeData | null;
  handleUnlockSuccess: () => void;
  closeUnlockModal: () => void;
  // Router
  onBack: () => void;
}

export function DesktopWatchView({
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
  similarVideos,
  showUnlockModal,
  lockedEpisodeId,
  pendingEpisode,
  handleUnlockSuccess,
  closeUnlockModal,
  onBack,
}: DesktopWatchViewProps) {
  return (
    <div className="hidden lg:flex min-h-[calc(100vh-60px)] bg-black flex-row overflow-hidden">
      {/* Left: Video Player */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        <button
          onClick={onBack}
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
            <VideoPlaceholder
              isProcessing={currentEpisode?.encodingStatus === 'PROCESSING'}
              variant="desktop"
            />
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
          onClose={closeUnlockModal}
          onUnlocked={handleUnlockSuccess}
        />
      )}
    </div>
  );
}
