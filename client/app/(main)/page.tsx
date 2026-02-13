'use client';

import { useEffect, useState } from 'react';
import { Flame, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { videoApi } from '@/lib/api';
import { HeroBanner, BannerItem } from '@/components/home/HeroBanner';
import { VideoRow } from '@/components/home/VideoRow';
import { VideoCardData } from '@/components/video/VideoCard';
import { Loading } from '@/components/common/Loading';

export default function HomePage() {
  const { isAuthenticated, guestLogin, isLoading: authLoading } = useAuthStore();
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  const [trending, setTrending] = useState<VideoCardData[]>([]);
  const [newReleases, setNewReleases] = useState<VideoCardData[]>([]);
  const [allVideos, setAllVideos] = useState<VideoCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto guest login
  useEffect(() => {
    const autoLogin = async () => {
      if (!isAuthenticated && !authLoading) {
        try {
          await guestLogin();
        } catch {
          // Silent fail - user can still browse
        }
      }
    };
    autoLogin();
  }, [isAuthenticated, guestLogin, authLoading]);

  // Fetch videos from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // For testing, load all videos regardless of status
        const [trendingRes, newReleasesRes, allRes] = await Promise.allSettled([
          videoApi.trending(12).catch(() => []),
          videoApi.newReleases(12).catch(() => []),
          videoApi.list({ limit: 20, sort: 'createdAt', order: 'desc' }),
        ]);

        // Process trending (fallback to recent videos if trending fails)
        if (trendingRes.status === 'fulfilled' && Array.isArray(trendingRes.value) && trendingRes.value.length > 0) {
          setTrending(trendingRes.value);
          setBannerItems(trendingRes.value.slice(0, 5).map(mapToBanner));
        } else {
          console.log('No trending videos, will use recent videos');
        }

        // Process new releases (fallback if fails)
        if (newReleasesRes.status === 'fulfilled' && Array.isArray(newReleasesRes.value) && newReleasesRes.value.length > 0) {
          setNewReleases(newReleasesRes.value);
        } else {
          console.log('No new releases, will use recent videos');
        }

        // Process all videos (main content)
        if (allRes.status === 'fulfilled') {
          const result = allRes.value as any;
          const data = Array.isArray(result) ? result : result?.items || result?.data || [];
          console.log('All videos loaded:', data.length, 'videos');
          setAllVideos(data);

          // Fallback: if no trending/new releases, use all videos
          if (trending.length === 0 && newReleases.length === 0 && data.length > 0) {
            console.log('Using all videos for banner and sections');
            setBannerItems(data.slice(0, 5).map(mapToBanner));
            setTrending(data.slice(0, 12));
            setNewReleases(data.slice(0, 12));
          }
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        // Try to load at least some fallback content
        try {
          const fallback = await videoApi.list({ limit: 10 });
          const data = Array.isArray(fallback) ? fallback : fallback?.items || [];
          if (data.length > 0) {
            setAllVideos(data);
            setBannerItems(data.slice(0, 3).map(mapToBanner));
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading && !bannerItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="xl" text="Đang tải phim..." />
      </div>
    );
  }

  return (
    <div className="pb-16 lg:pb-0">
      {/* Hero Banner */}
      {bannerItems.length > 0 && <HeroBanner items={bannerItems} />}

      {/* Trending */}
      {trending.length > 0 && (
        <VideoRow
          title="Xu hướng"
          videos={trending}
          href="/category/trending"
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          badge="HOT"
          showRank
        />
      )}

      {/* New Releases */}
      {newReleases.length > 0 && (
        <VideoRow
          title="Mới cập nhật"
          videos={newReleases}
          href="/category/new"
          icon={<Clock className="w-5 h-5 text-green-500" />}
        />
      )}

      {/* Popular */}
      {allVideos.length > 0 && (
        <VideoRow
          title="Phổ biến"
          videos={allVideos}
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
          variant="landscape"
        />
      )}

      {/* Empty state */}
      {!loading && !trending.length && !newReleases.length && !allVideos.length && (
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-20 text-center">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Chưa có phim nào</h2>
          <p className="text-gray-500">Hệ thống đang được cập nhật nội dung. Quay lại sau nhé!</p>
        </div>
      )}
    </div>
  );
}

// Helper: map API video object to BannerItem
function mapToBanner(v: any): BannerItem {
  return {
    id: v.id,
    title: v.title,
    description: v.description || '',
    poster: v.poster,
    banner: v.banner,
    genres: v.genres,
    releaseYear: v.releaseYear,
    ratingAverage: v.ratingAverage,
    ratingCount: v.ratingCount,
    viewCount: v.viewCount,
    isVipOnly: v.isVipOnly,
    slug: v.slug || v.id,
  };
}
