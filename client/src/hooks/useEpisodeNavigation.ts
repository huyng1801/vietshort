'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { unlockApi } from '@/lib/api';
import type { VideoData, EpisodeData } from '@/components/watch';

interface UseEpisodeNavigationProps {
  video: VideoData | null;
  currentEpisode: EpisodeData | null;
  setCurrentEpisode: (ep: EpisodeData | null) => void;
  slug: string;
  episodeAccessMap: Record<string, boolean>;
  setEpisodeAccessMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function useEpisodeNavigation({
  video,
  currentEpisode,
  setCurrentEpisode,
  slug,
  episodeAccessMap,
  setEpisodeAccessMap,
}: UseEpisodeNavigationProps) {
  const router = useRouter();

  // ─── Unlock Modal State ──────────────────────────────────
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [lockedEpisodeId, setLockedEpisodeId] = useState<string | null>(null);
  const [pendingEpisode, setPendingEpisode] = useState<EpisodeData | null>(null);

  // ─── Episode Chunks (groups of 50) ───────────────────────
  const [activeTab, setActiveTab] = useState(0);

  const episodeChunks = useMemo(() => {
    if (!video?.episodes) return [];
    const chunks = [];
    for (let i = 0; i < video.episodes.length; i += 50) {
      chunks.push(video.episodes.slice(i, i + 50));
    }
    return chunks;
  }, [video?.episodes]);

  // Sync active tab when current episode changes
  useEffect(() => {
    if (currentEpisode) {
      const index = video?.episodes?.findIndex((ep) => ep.id === currentEpisode.id) || 0;
      setActiveTab(Math.floor(index / 50));
    }
  }, [currentEpisode, video?.episodes]);

  // ─── Navigation Helpers ──────────────────────────────────
  const currentIndex = useMemo(() => {
    if (!video?.episodes || !currentEpisode) return -1;
    return video.episodes.findIndex((ep) => ep.id === currentEpisode.id);
  }, [video?.episodes, currentEpisode]);

  const hasPrev = currentIndex > 0;
  const hasNext = video?.episodes ? currentIndex < video.episodes.length - 1 : false;

  const playEpisode = useCallback(
    async (episode: EpisodeData) => {
      try {
        const access = await unlockApi.checkAccess(episode.id);
        if (!access.hasAccess) {
          setLockedEpisodeId(episode.id);
          setPendingEpisode(episode);
          setShowUnlockModal(true);
          return;
        }
      } catch {}
      setCurrentEpisode(episode);
      router.replace(`/watch/${slug}?ep=${episode.episodeNumber}`, { scroll: false });
    },
    [slug, router, setCurrentEpisode],
  );

  const handleUnlockSuccess = useCallback(() => {
    setShowUnlockModal(false);
    if (pendingEpisode) {
      setCurrentEpisode(pendingEpisode);
      router.replace(`/watch/${slug}?ep=${pendingEpisode.episodeNumber}`, { scroll: false });
      setPendingEpisode(null);
      if (lockedEpisodeId) {
        setEpisodeAccessMap((prev) => ({ ...prev, [lockedEpisodeId]: true }));
      }
    }
    setLockedEpisodeId(null);
  }, [pendingEpisode, slug, router, lockedEpisodeId, setCurrentEpisode, setEpisodeAccessMap]);

  const closeUnlockModal = useCallback(() => {
    setShowUnlockModal(false);
    setPendingEpisode(null);
    setLockedEpisodeId(null);
  }, []);

  const nextEpisode = useCallback(() => {
    if (!video?.episodes || !hasNext) return;
    playEpisode(video.episodes[currentIndex + 1]);
  }, [video?.episodes, currentIndex, hasNext, playEpisode]);

  const prevEpisode = useCallback(() => {
    if (!video?.episodes || !hasPrev) return;
    playEpisode(video.episodes[currentIndex - 1]);
  }, [video?.episodes, currentIndex, hasPrev, playEpisode]);

  return {
    // Episode chunks & tabs
    episodeChunks,
    activeTab,
    setActiveTab,
    // Navigation
    currentIndex,
    hasPrev,
    hasNext,
    playEpisode,
    nextEpisode,
    prevEpisode,
    // Unlock modal
    showUnlockModal,
    lockedEpisodeId,
    pendingEpisode,
    handleUnlockSuccess,
    closeUnlockModal,
  };
}
