'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { videoApi, subtitleApi } from '@/lib/api';
import type { SubtitleRaw } from '@/lib/api/video';
import type { SubtitleTrack, EpisodeData } from '@/components/watch';

export function useEpisodeStream(
  currentEpisode: EpisodeData | null,
  videoId: string | undefined,
) {
  // ─── Subtitles ────────────────────────────────────────────
  const [episodeSubtitles, setEpisodeSubtitles] = useState<SubtitleRaw[]>([]);

  useEffect(() => {
    if (!currentEpisode?.id) {
      setEpisodeSubtitles([]);
      return;
    }
    setEpisodeSubtitles([]);
    subtitleApi
      .byEpisode(currentEpisode.id)
      .then((data) => setEpisodeSubtitles(data || []))
      .catch(() => {});
  }, [currentEpisode?.id]);
  
  const subtitles: SubtitleTrack[] = useMemo(() => {
    return episodeSubtitles
      .filter((sub) => sub.status === 'COMPLETED')
      .map((sub, idx) => ({
        id: sub.id,
        label: sub.label || sub.language || 'Unknown',
        language: sub.language,
        url: sub.srtUrl || '',
        content: sub.content || '',
        isDefault: idx === 0,
      }));
  }, [episodeSubtitles]);

  // ─── Stream Source ────────────────────────────────────────
  const streamSrc = useMemo(() => {
    if (!currentEpisode?.hlsManifest || currentEpisode.encodingStatus !== 'COMPLETED') return null;
    return currentEpisode.hlsManifest;
  }, [currentEpisode]);

  // ─── Progress Reporting ───────────────────────────────────
  const handleProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (!videoId || !currentEpisode?.id) return;
      videoApi
        .updateProgress(videoId, {
          episodeId: currentEpisode.id,
          progressive: duration > 0 ? currentTime / duration : 0,
        })
        .catch(() => {});
    },
    [videoId, currentEpisode?.id],
  );

  return {
    subtitles,
    streamSrc,
    handleProgress,
  };
}
