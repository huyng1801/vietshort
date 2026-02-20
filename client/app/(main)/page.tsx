'use client';

import { useEffect, useState } from 'react';
import { Clock, Play, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { videoApi, bannerApi, watchHistoryApi, recommendApi } from '@/lib/api';
import { HeroBanner, BannerItem } from '@/components/home/HeroBanner';
import { VideoGrid } from '@/components/home/VideoGrid';
import { VideoCardData } from '@/components/video/VideoCard';
import { Loading } from '@/components/common/Loading';

interface GenreData {
  id: string;
  name: string;
  slug: string;
}

interface GenreSection {
  genre: GenreData;
  videos: VideoCardData[];
}

export default function HomePage() {
  const { isAuthenticated, guestLogin, isLoading: authLoading } = useAuthStore();
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<VideoCardData[]>([]);
  const [newReleases, setNewReleases] = useState<VideoCardData[]>([]);
  const [recommended, setRecommended] = useState<VideoCardData[]>([]);
  const [genreSections, setGenreSections] = useState<GenreSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto guest login
  useEffect(() => {
    const autoLogin = async () => {
      if (!isAuthenticated && !authLoading) {
        try {
          await guestLogin();
        } catch {
          // Silent fail
        }
      }
    };
    autoLogin();
  }, [isAuthenticated, guestLogin, authLoading]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch banners, new releases, genres in parallel
        const [bannersRes, newReleasesRes, genresRes] = await Promise.allSettled([
          bannerApi.list(5).catch(() => ({ success: false, data: [] })),
          videoApi.newReleases(12).catch(() => []),
          videoApi.genres().catch(() => []),
        ]);

        // Process banners
        if (bannersRes.status === 'fulfilled') {
          const bannerData = bannersRes.value;
          if (bannerData?.success && Array.isArray(bannerData.data) && bannerData.data.length > 0) {
            setBannerItems(bannerData.data.map(mapBannerToBannerItem));
          }
        }

        // Process new releases
        if (newReleasesRes.status === 'fulfilled') {
          const data = newReleasesRes.value;
          setNewReleases(Array.isArray(data) ? data : []);
        }

        // Process genres and fetch videos per genre
        if (genresRes.status === 'fulfilled') {
          const genres: GenreData[] = Array.isArray(genresRes.value) ? genresRes.value : [];
          if (genres.length > 0) {
            const genreVideoPromises = genres.slice(0, 6).map(async (genre) => {
              try {
                const res = await videoApi.byGenre(genre.name, 6);
                const videos = res?.data || (Array.isArray(res) ? res : []);
                return { genre, videos };
              } catch {
                return { genre, videos: [] };
              }
            });
            const results = await Promise.all(genreVideoPromises);
            setGenreSections(results.filter((s) => s.videos.length > 0));
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch continue watching (requires auth)
  useEffect(() => {
    if (!isAuthenticated) {
      setContinueWatching([]);
      return;
    }
    const fetchWatch = async () => {
      try {
        const res = await watchHistoryApi.list(1, 6);
        const items = res?.data || [];
        // Map watch history items to VideoCardData
        const mapped: VideoCardData[] = items
          .filter((item: any) => item.video)
          .map((item: any) => ({
            id: item.video.id,
            title: item.video.title,
            slug: item.video.slug,
            poster: item.video.poster,
            duration: item.video.duration,
            viewCount: item.video.viewCount,
            ratingAverage: item.video.ratingAverage,
            isVipOnly: item.video.isVipOnly,
            genres: item.video.genres,
          }));
        setContinueWatching(mapped);
      } catch {
        setContinueWatching([]);
      }
    };
    fetchWatch();
  }, [isAuthenticated]);

  // Fetch recommendations (requires auth)
  useEffect(() => {
    if (!isAuthenticated) {
      setRecommended([]);
      return;
    }
    const fetchRecommend = async () => {
      try {
        const res = await recommendApi.forUser(14);
        const videos = Array.isArray(res) ? res : [];
        setRecommended(videos);
      } catch {
        setRecommended([]);
      }
    };
    fetchRecommend();
  }, [isAuthenticated]);

  if (loading && !bannerItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="xl" text="Đang tải phim..." />
      </div>
    );
  }

  return (
    <div className="pb-16 lg:pb-0">
      {/* Hero Banner - full width */}
      {bannerItems.length > 0 && <HeroBanner items={bannerItems} />}

      {/* Main content: grid + ranking sidebar */}
      <div className="mx-auto px-2 lg:px-32 mt-6 lg:mt-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Left: Video sections */}
          <div className="flex-1 min-w-0">
            {/* Tiếp tục xem */}
            {continueWatching.length > 0 && (
              <VideoGrid
                title="Tiếp tục xem"
                videos={continueWatching}
                maxItems={6}
              />
            )}

            {/* Mới phát hành */}
            {newReleases.length > 0 && (
              <VideoGrid
                title="Mới cập nhật"
                videos={newReleases}
                href="/category/new"
                maxItems={12}
              />
            )}

            {/* Thể loại sections */}
            {genreSections.map((section) => (
              <VideoGrid
                key={section.genre.id}
                title={section.genre.name}
                videos={section.videos}
                href={`/category/${section.genre.slug}`}
                maxItems={6}
              />
            ))}

            {/* Gợi ý cho bạn */}
            {recommended.length > 0 && (
              <VideoGrid
                title="Gợi ý cho bạn"
                videos={recommended}
                maxItems={14}
              />
            )}

            {/* Empty state */}
            {!loading && !newReleases.length && !genreSections.length && !continueWatching.length && (
              <div className="py-20 text-center">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Chưa có phim nào</h2>
                <p className="text-gray-500">Hệ thống đang được cập nhật nội dung. Quay lại sau nhé!</p>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}

// Helper: map backend Banner object to HeroBanner's BannerItem
// Backend trả về: { id, title, imageUrl, linkType, linkTarget, sortOrder }
function mapBannerToBannerItem(banner: any): BannerItem {
  return {
    id: banner.id,
    title: banner.title || 'Banner',
    imageUrl: banner.imageUrl || '/images/placeholder.jpg',
    linkType: banner.linkType, // "video" | "external" | "promotion" | null
    linkTarget: banner.linkTarget, // Video ID/slug hoặc external URL
    sortOrder: banner.sortOrder,
  };
}
