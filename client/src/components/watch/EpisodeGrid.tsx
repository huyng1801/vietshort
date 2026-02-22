'use client';

import { Loader2, Crown, Lock } from 'lucide-react';
import { EpisodeData } from './types';

interface EpisodeGridProps {
  episodeChunks: EpisodeData[][];
  activeTab: number;
  setActiveTab: (tab: number) => void;
  currentEpisodeId: string | null;
  episodeAccessMap: Record<string, boolean>;
  playEpisode: (episode: EpisodeData) => void;
  totalEpisodes: number;
  variant?: 'mobile' | 'desktop';
  onEpisodeSelected?: () => void;
}

export function EpisodeGrid({
  episodeChunks,
  activeTab,
  setActiveTab,
  currentEpisodeId,
  episodeAccessMap,
  playEpisode,
  totalEpisodes,
  variant = 'desktop',
  onEpisodeSelected,
}: EpisodeGridProps) {
  const isMobile = variant === 'mobile';

  return (
    <div>
      {/* Tab selector for chunks */}
      {episodeChunks.length > 1 && (
        <div className={`flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar ${
          isMobile ? 'text-sm font-medium' : 'gap-3 lg:gap-4'
        }`}>
          {episodeChunks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`relative py-1 font-bold transition-colors whitespace-nowrap ${
                isMobile
                  ? (activeTab === idx ? 'text-red-500' : 'text-gray-500')
                  : `text-xs sm:text-sm ${activeTab === idx ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`
              }`}
            >
              {idx * 50 + 1}-{Math.min((idx + 1) * 50, totalEpisodes)}
              {!isMobile && activeTab === idx && (
                <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className={
        isMobile
          ? 'grid grid-cols-5 gap-2'
          : 'grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-8 gap-1.5 sm:gap-2'
      }>
        {episodeChunks[activeTab]?.map((episode) => {
          const isActive = currentEpisodeId === episode.id;
          const isReady = episode.encodingStatus === 'COMPLETED' && episode.hlsManifest;
          const isProcessing = episode.encodingStatus === 'PROCESSING';
          const hasAccess = episodeAccessMap[episode.id] !== false;
          const needsUnlock = isReady && !hasAccess;

          return (
            <button
              key={episode.id}
              onClick={() => {
                if (isReady || needsUnlock) {
                  playEpisode(episode);
                  onEpisodeSelected?.();
                }
              }}
              disabled={!isReady && !needsUnlock}
              className={`relative aspect-square rounded-lg flex items-center justify-center font-semibold transition-all ${
                isMobile
                  ? `text-sm ${
                      isActive
                        ? 'bg-red-600 text-white ring-2 ring-red-400 ring-offset-1 ring-offset-[#0a0a0a]'
                        : needsUnlock
                          ? 'bg-[#1a1a1a] text-gray-300'
                          : isReady
                            ? 'bg-[#1a1a1a] text-gray-300 active:bg-[#222]'
                            : 'bg-[#111] text-gray-600 cursor-not-allowed'
                    }`
                  : `text-xs sm:text-sm lg:text-base sm:rounded-md ${
                      isActive
                        ? 'bg-red-600/20 text-red-400 ring-1 ring-red-500'
                        : needsUnlock
                          ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'
                          : isReady
                            ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222]'
                            : 'bg-[#111] text-gray-600 cursor-not-allowed'
                    }`
              }`}
            >
              {isProcessing ? (
                <Loader2 className={`animate-spin text-gray-500 ${isMobile ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4'}`} />
              ) : isActive && isMobile ? (
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 mb-0.5">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="8" width="4" height="12" rx="1">
                        <animate attributeName="height" values="12;16;12" dur="0.6s" repeatCount="indefinite" />
                        <animate attributeName="y" values="8;6;8" dur="0.6s" repeatCount="indefinite" />
                      </rect>
                      <rect x="10" y="4" width="4" height="16" rx="1">
                        <animate attributeName="height" values="16;8;16" dur="0.6s" repeatCount="indefinite" />
                        <animate attributeName="y" values="4;8;4" dur="0.6s" repeatCount="indefinite" />
                      </rect>
                      <rect x="17" y="6" width="4" height="14" rx="1">
                        <animate attributeName="height" values="14;18;14" dur="0.6s" repeatCount="indefinite" />
                        <animate attributeName="y" values="6;3;6" dur="0.6s" repeatCount="indefinite" />
                      </rect>
                    </svg>
                  </div>
                  <span className="text-[10px]">{episode.episodeNumber}</span>
                </div>
              ) : isActive && !isMobile ? (
                <div className="flex flex-col items-center gap-0.5">
                  <span>{episode.episodeNumber}</span>
                  <div className="flex gap-[2px]">
                    <div className="w-[3px] h-2 bg-red-500 rounded-full animate-pulse" />
                    <div className="w-[3px] h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                    <div className="w-[3px] h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              ) : (
                episode.episodeNumber
              )}
              {needsUnlock && (
                <div className={`absolute flex items-center justify-center ${
                  isMobile
                    ? 'top-1 right-1 w-4 h-4 bg-yellow-500 rounded-full'
                    : 'top-0.5 right-0.5 sm:top-1 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded-full'
                }`}>
                  {isMobile
                    ? <Crown className="w-2.5 h-2.5 text-white" />
                    : <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                  }
                </div>
              )}
              {!isMobile && !isReady && !isProcessing && !needsUnlock && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gray-700 rounded-full flex items-center justify-center">
                  <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-gray-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
