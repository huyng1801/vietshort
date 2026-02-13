'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Settings, 
  Volume2, 
  Maximize,
  Heart,
  Star,
  Share2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { videoApi } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import Link from 'next/link';

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
  episodes: EpisodeData[];
}

interface EpisodeData {
  id: string;
  episodeNumber: number;
  title?: string;
  hlsManifest?: string;
  duration?: number;
  encodingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const epParam = searchParams.get('ep');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [video, setVideo] = useState<VideoData | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await videoApi.bySlug(slug);
        setVideo(videoData);
        
        // Set episode from query param or default to first
        let targetEp = null;
        if (epParam) {
          targetEp = videoData.episodes?.find((ep: EpisodeData) => ep.episodeNumber === parseInt(epParam));
        }

        if (!targetEp) {
          const completedEpisodes = videoData.episodes?.filter((ep: EpisodeData) => 
            ep.encodingStatus === 'COMPLETED' && ep.hlsManifest
          ) || [];
          targetEp = completedEpisodes.length > 0 ? completedEpisodes[0] : videoData.episodes?.[0];
        }
        
        setCurrentEpisode(targetEp || null);
        
      } catch (err) {
        console.error('Failed to fetch video:', err);
        setError('Không thể tải video. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchVideo();
    }
  }, [slug, epParam]);

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

  // Setup video element and playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle volume change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const playEpisode = (episode: EpisodeData) => {
    setCurrentEpisode(episode);
    router.replace(`/watch/${slug}?ep=${episode.episodeNumber}`);
  };

  const nextEpisode = () => {
    if (!video?.episodes || !currentEpisode) return;
    const currentIndex = video.episodes.findIndex(ep => ep.id === currentEpisode.id);
    const nextEp = video.episodes[currentIndex + 1];
    if (nextEp) playEpisode(nextEp);
  };

  const prevEpisode = () => {
    if (!video?.episodes || !currentEpisode) return;
    const currentIndex = video.episodes.findIndex(ep => ep.id === currentEpisode.id);
    const prevEp = video.episodes[currentIndex - 1];
    if (prevEp) playEpisode(prevEp);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loading size="xl" text="Đ lifestyle video..." />
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

      {/* Left Column: Video Player - Centered in remaining space */}
      <div 
        ref={containerRef}
        className="flex-1 bg-black relative flex items-center justify-center"
      >
        <div className="h-full aspect-[9/16] relative group flex items-center justify-center bg-black overflow-hidden">
          {currentEpisode?.hlsManifest && currentEpisode.encodingStatus === 'COMPLETED' ? (
            <>
              <video
                ref={videoRef}
                key={currentEpisode.id}
                className="h-full w-auto max-w-full object-contain"
                poster={video.poster}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={nextEpisode}
                playsInline
                autoPlay
              >
                <source src={currentEpisode.hlsManifest} type="application/x-mpegURL" />
              </video>

              {/* Overlay: Back button desktop */}
              <button 
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-50 p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full text-white hidden lg:flex items-center justify-center transition-all border border-white/5"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-20 pb-8 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <input
                  type="range"
                  min="0"
                  max={videoRef.current?.duration || 0}
                  value={videoRef.current?.currentTime || 0}
                  step="0.1"
                  onChange={(e) => {
                    if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value);
                  }}
                  className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer mb-6"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                      ((videoRef.current?.currentTime || 0) / (videoRef.current?.duration || 1)) * 100
                    }%, rgba(255,255,255,0.2) ${
                      ((videoRef.current?.currentTime || 0) / (videoRef.current?.duration || 1)) * 100
                    }%, rgba(255,255,255,0.2) 100%)`
                  }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()} className="text-white hover:scale-110 transition-transform">
                      {isPlaying ? <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <Play className="w-7 h-7 fill-white" />}
                    </button>
                    <div className="hidden sm:flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-white" />
                      <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 h-1 bg-white/20 rounded cursor-pointer" />
                    </div>
                    <span className="text-white text-sm font-medium">{formatTime(videoRef.current?.currentTime || 0)} / {formatTime(videoRef.current?.duration || 0)}</span>
                  </div>

                  <div className="flex items-center gap-4">
                     {/* Speed selector */}
                     <div className="relative">
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="px-3 py-1 text-white text-xs font-bold border border-white/30 rounded uppercase tracking-wider hover:bg-white/10 transition-colors"
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full mb-3 right-0 bg-[#1a1a1a] border border-white/10 rounded-xl py-2 w-24 overflow-hidden shadow-2xl z-50">
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => {
                                setPlaybackSpeed(speed);
                                setShowSpeedMenu(false);
                              }}
                              className={`block w-full px-4 py-2 text-xs font-medium text-left transition-colors ${
                                playbackSpeed === speed ? 'text-red-500 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={toggleFullscreen} className="text-white hover:scale-110 transition-transform">
                      <Maximize className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer" onClick={() => videoRef.current?.play()}>
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105">
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-10 text-center">
              <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center mb-6">
                <Play className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">
                {currentEpisode?.encodingStatus === 'PROCESSING' ? 'Đang mã hóa tập phim...' : 'Tập phim chưa sẵn sàng'}
              </h3>
              <p className="text-gray-500 text-sm">Vui lòng quay lại sau ít phút hoặc thử tập phim khác.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Content & Metadata - Fixed width on large screens */}
      <div className="w-full lg:w-[450px] xl:w-[500px] bg-[#0a0a0a] border-l border-white/5 flex-shrink-0 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/video/${video.slug}`} className="hover:text-white transition-colors">{video.title}</Link>
            <span>/</span>
            <span className="text-gray-300 font-medium">Episode {currentEpisode?.episodeNumber}</span>
          </nav>

          {/* Video Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-6">
            Episode {currentEpisode?.episodeNumber} - {video.title} Full Movie
          </h1>

          {/* Description Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-3">Plot of Episode {currentEpisode?.episodeNumber}</h3>
            <div className="relative">
              <p className={`text-gray-400 leading-relaxed ${!descExpanded ? 'line-clamp-2' : ''}`}>
                {video.description || `Aria might not answer Luca at all, but Bound By Honor Episode ${currentEpisode?.episodeNumber} shows how Luca pays no compromises to the creepy Raffaele! He cuts Raffaele's pinky to make people understand that Aria is only his. But how will Aria and Luca progress their love story?`}
              </p>
              <button 
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-1 text-red-500 font-bold hover:text-red-400 text-sm"
              >
                {descExpanded ? 'Less' : 'More'}
              </button>
            </div>
          </div>

          {/* Tags / Genres */}
          <div className="flex flex-wrap gap-2 mb-10">
            {video.genres?.split(',').map((genre, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors cursor-default">
                {genre.trim()}
              </span>
            ))}
          </div>

          {/* Interaction Counters */}
          <div className="flex items-center gap-10 mb-10 border-b border-white/5 pb-10">
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-red-500/10 transition-colors">
                <Heart className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
              </div>
              <span className="text-xs font-bold text-gray-500">14.9k</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-yellow-500/10 transition-colors">
                <Star className="w-6 h-6 text-gray-400 group-hover:text-yellow-500" />
              </div>
              <span className="text-xs font-bold text-gray-500">3.4M</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                <Share2 className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
              </div>
              <span className="text-xs font-bold text-gray-500">Share</span>
            </div>
          </div>

          {/* Episode Selector */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {episodeChunks.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`relative py-2 text-sm font-bold transition-colors whitespace-nowrap ${
                    activeTab === idx ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {idx * 50} - {Math.min((idx + 1) * 50 - 1, video.episodes.length - 1)}
                  {activeTab === idx && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-red-600 rounded-full" />}
                </button>
              ))}
            </div>
            <Link 
              href={`/video/${video.slug}`} 
              className="text-gray-400 hover:text-white flex items-center gap-1 text-sm font-medium transition-all group"
            >
              All Episodes <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Episode Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-3">
            {activeTab === 0 && (
              <button className="aspect-[1.5/1] bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-sm font-bold text-gray-300 hover:bg-white/10 transition-colors">
                Trailer
              </button>
            )}
            {episodeChunks[activeTab]?.map((episode) => {
              const isActive = currentEpisode?.id === episode.id;
              const isLocked = false; // Add logic for locked episodes if needed
              
              return (
                <button
                  key={episode.id}
                  onClick={() => playEpisode(episode)}
                  className={`relative aspect-[1.5/1] rounded-lg flex items-center justify-center text-sm font-bold transition-all border ${
                    isActive 
                      ? 'bg-red-600/10 border-red-600 text-red-600' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {episode.episodeNumber}
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                      <Lock className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute bottom-1 right-1">
                      <div className="flex gap-[1px] items-end h-2">
                        <div className="w-[2px] h-full bg-red-600 animate-pulse" />
                        <div className="w-[2px] h-2/3 bg-red-600 animate-pulse delay-75" />
                        <div className="w-[2px] h-1/2 bg-red-600 animate-pulse delay-150" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}