'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Calendar, Crown, Film } from 'lucide-react';
import { VideoData, EpisodeData, formatCount } from './types';
import { EpisodeGrid } from './EpisodeGrid';
import { LikeButton, BookmarkButton } from '@/components/video/LikeButton';
import { RatingStars } from '@/components/video/RatingStars';
import { ShareButton } from '@/components/video/ShareButton';
import { CommentSection } from '@/components/video/CommentSection';
import { VideoCardData } from '@/components/video/VideoCard';

interface DesktopWatchSidebarProps {
  video: VideoData;
  currentEpisode: EpisodeData | null;
  episodeChunks: EpisodeData[][];
  activeTab: number;
  setActiveTab: (tab: number) => void;
  episodeAccessMap: Record<string, boolean>;
  playEpisode: (episode: EpisodeData) => void;
  similarVideos: VideoCardData[];
}

export function DesktopWatchSidebar({
  video,
  currentEpisode,
  episodeChunks,
  activeTab,
  setActiveTab,
  episodeAccessMap,
  playEpisode,
  similarVideos,
}: DesktopWatchSidebarProps) {
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <div className="w-full lg:w-[400px] xl:w-[450px] bg-[#0a0a0a] border-l border-white/5 flex-shrink-0 flex flex-col h-[calc(100vh-60px)]">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-gray-500 mb-3 sm:mb-4 lg:mb-6">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href={`/video/${video.slug}`} className="hover:text-white transition-colors line-clamp-1 max-w-[100px] sm:max-w-[140px]">{video.title}</Link>
          <span>/</span>
          <span className="text-gray-300 font-medium">Tập {currentEpisode?.episodeNumber}</span>
        </nav>

        {/* Video Title */}
        <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">
          {video.title}
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm lg:text-base mb-2 sm:mb-3 lg:mb-4">
          Tập {currentEpisode?.episodeNumber}{video.totalEpisodes ? ` / ${video.totalEpisodes}` : ''}
          {currentEpisode?.title && ` - ${currentEpisode.title}`}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6 text-xs sm:text-sm lg:text-base text-gray-500">
          {video.viewCount != null && (
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {formatCount(video.viewCount)} lượt xem</span>
          )}
          {video.releaseYear && (
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {video.releaseYear}</span>
          )}
          {video.isVipOnly && (
            <span className="flex items-center gap-1 text-yellow-500"><Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> VIP Gold</span>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="relative">
              <p className={`text-gray-400 text-xs sm:text-sm lg:text-base leading-relaxed ${!descExpanded ? 'line-clamp-2' : ''}`}>
                {video.description}
              </p>
              {video.description.length > 150 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-1 text-red-500 font-bold hover:text-red-400 text-xs sm:text-sm"
                >
                  {descExpanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tags / Genres */}
        {video.genres && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 lg:mb-6">
            {video.genres.split(',').map((genre, idx) => (
              <span key={idx} className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white/5 border border-white/10 rounded text-[10px] sm:text-xs lg:text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors cursor-default">
                {genre.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Rating Section */}
        <div className="mb-2 sm:mb-3 lg:mb-4 py-2 sm:py-3 lg:py-4 border-t border-white/5 border-b border-white/5">
          <RatingStars
            videoId={video.id}
            averageRating={video.ratingAverage || 0}
            ratingCount={video.ratingCount || 0}
            size="md"
          />
        </div>

        {/* Like, Bookmark, Share Section */}
        <div className="flex items-center justify-around mb-3 sm:mb-4 lg:mb-6 py-2 sm:py-3 lg:py-4 border-b border-white/5">
          <LikeButton videoId={video.id} likeCount={video.likeCount || 0} />
          <BookmarkButton videoId={video.id} />
          <ShareButton videoId={video.id} title={video.title} slug={video.slug} />
        </div>

        {/* Episode Selector */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg">Danh sách tập</h3>
            </div>
          </div>
          <EpisodeGrid
            episodes={video.episodes}
            episodeChunks={episodeChunks}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentEpisodeId={currentEpisode?.id || null}
            episodeAccessMap={episodeAccessMap}
            playEpisode={playEpisode}
            totalEpisodes={video.totalEpisodes || video.episodes.length}
            variant="desktop"
          />
        </div>

        {/* Comments Section */}
        <CommentSection videoId={video.id} />

        {/* Similar Videos */}
        {similarVideos.length > 0 && (
          <div className="mt-4 sm:mt-5 lg:mt-6 pt-3 sm:pt-4 border-t border-white/5">
            <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              Phim tương tự
            </h3>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {similarVideos.slice(0, 6).map((v) => (
                <Link
                  key={v.id}
                  href={`/watch/${v.slug || v.id}`}
                  className="group"
                >
                  <div className="aspect-[2/3] rounded-md sm:rounded-lg overflow-hidden bg-white/5 mb-1 sm:mb-1.5">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundImage: `url(${v.poster || v.thumbnail || '/images/placeholder.jpg'})` }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 font-medium line-clamp-2 group-hover:text-white transition-colors">
                    {v.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
