'use client';

import { useState, useEffect } from 'react';
import { Star, Eye, Calendar, Crown, X } from 'lucide-react';
import { VideoData, EpisodeData, formatCount } from './types';
import { EpisodeGrid } from './EpisodeGrid';
import { RatingStars } from './RatingStars';

interface MobileBottomSheetProps {
  video: VideoData;
  currentEpisode: EpisodeData | null;
  episodeChunks: EpisodeData[][];
  activeTab: number;
  setActiveTab: (tab: number) => void;
  episodeAccessMap: Record<string, boolean>;
  playEpisode: (episode: EpisodeData) => void;
  show: boolean;
  onClose: () => void;
  initialTab: 'info' | 'episodes';
}

export function MobileBottomSheet({
  video,
  currentEpisode,
  episodeChunks,
  activeTab,
  setActiveTab,
  episodeAccessMap,
  playEpisode,
  show,
  onClose,
  initialTab,
}: MobileBottomSheetProps) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (show) setTab(initialTab);
  }, [initialTab, show]);

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-2xl z-50 max-h-[70vh] flex flex-col animate-slide-up-panel">
        {/* Handle bar */}
        <div className="flex items-center justify-center pt-2.5 pb-0.5">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-[68px] rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${video.poster || '/images/placeholder.jpg'})` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-sm line-clamp-2">{video.title}</h2>
              {video.genres && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {video.genres.split(',').slice(0, 3).map((genre, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-gray-400">
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 text-[11px] font-bold">{(video.ratingAverage || 0).toFixed(1)}</span>
                <span className="text-gray-600 text-[10px] ml-0.5">·</span>
                <span className="text-gray-500 text-[10px]">{video.totalEpisodes || video.episodes.length} tập</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setTab('info')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'info' ? 'text-white border-b-2 border-red-500' : 'text-gray-500'
            }`}
          >
            Giới thiệu
          </button>
          <button
            onClick={() => setTab('episodes')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'episodes' ? 'text-white border-b-2 border-red-500' : 'text-gray-500'
            }`}
          >
            Tuyển tập ({video.totalEpisodes || video.episodes.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'info' ? (
            <div className="space-y-4">
              {video.description && (
                <p className="text-gray-400 text-sm leading-relaxed">{video.description}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {video.viewCount != null && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {formatCount(video.viewCount)} lượt xem
                  </span>
                )}
                {video.releaseYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {video.releaseYear}
                  </span>
                )}
                {video.isVipOnly && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Crown className="w-3.5 h-3.5" /> VIP
                  </span>
                )}
              </div>
              {/* Director / Actors */}
              {(video.director || video.actors) && (
                <div className="space-y-1.5 text-xs">
                  {video.director && (
                    <p className="text-gray-500">
                      <span className="text-gray-400 font-medium">Đạo diễn:</span> {video.director}
                    </p>
                  )}
                  {video.actors && (
                    <p className="text-gray-500">
                      <span className="text-gray-400 font-medium">Diễn viên:</span> {video.actors}
                    </p>
                  )}
                </div>
              )}
              {/* Rating */}
              <div className="py-3 border-t border-white/5">
                <RatingStars
                  videoId={video.id}
                  averageRating={video.ratingAverage || 0}
                  ratingCount={video.ratingCount || 0}
                  size="md"
                />
              </div>
            </div>
          ) : (
            <EpisodeGrid
              episodeChunks={episodeChunks}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentEpisodeId={currentEpisode?.id || null}
              episodeAccessMap={episodeAccessMap}
              playEpisode={playEpisode}
              totalEpisodes={video.totalEpisodes || video.episodes.length}
              variant="mobile"
              onEpisodeSelected={onClose}
            />
          )}
        </div>
      </div>
    </>
  );
}
