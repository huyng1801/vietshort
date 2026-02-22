'use client';

import { useEffect, useState } from 'react';
import { videoApi, recommendApi, unlockApi } from '@/lib/api';
import { recordWatchActivity } from '@/components/rewards';
import { dailyTasksApi } from '@/lib/api';
import type { VideoCardData } from '@/components/common';
import type { VideoData, EpisodeData } from '@/components/watch';

interface UseWatchVideoReturn {
  video: VideoData | null;
  currentEpisode: EpisodeData | null;
  setCurrentEpisode: React.Dispatch<React.SetStateAction<EpisodeData | null>>;
  loading: boolean;
  error: string | null;
  similarVideos: VideoCardData[];
  episodeAccessMap: Record<string, boolean>;
  setEpisodeAccessMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function useWatchVideo(slug: string, epParam: string | null): UseWatchVideoReturn {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarVideos, setSimilarVideos] = useState<VideoCardData[]>([]);
  const [episodeAccessMap, setEpisodeAccessMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await videoApi.bySlug(slug);
        setVideo(videoData);

        // Determine initial episode
        let targetEp = null;
        if (epParam) {
          targetEp = videoData.episodes?.find(
            (ep: EpisodeData) => ep.episodeNumber === parseInt(epParam),
          );
        }
        if (!targetEp) {
          const completed =
            videoData.episodes?.filter(
              (ep: EpisodeData) => ep.encodingStatus === 'COMPLETED' && ep.hlsManifest,
            ) || [];
          targetEp = completed.length > 0 ? completed[0] : videoData.episodes?.[0];
        }
        setCurrentEpisode(targetEp || null);

        // Side-effects (fire and forget)
        try { await videoApi.incrementView(videoData.id); } catch {}
        try { recordWatchActivity(); dailyTasksApi.trackWatch().catch(() => {}); } catch {}

        // Fetch similar videos
        try {
          const similar = await recommendApi.similar(videoData.id, 8);
          setSimilarVideos(similar || []);
        } catch {}

        // Build episode access map
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
            }),
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

  return {
    video,
    currentEpisode,
    setCurrentEpisode,
    loading,
    error,
    similarVideos,
    episodeAccessMap,
    setEpisodeAccessMap,
  };
}
