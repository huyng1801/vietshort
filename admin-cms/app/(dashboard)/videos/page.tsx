'use client';

import { useEffect, useState, useCallback } from 'react';
import { Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import type { Video, VideoStatus } from '@/types/admin';
import VideoHeader from '@/components/videos/VideoHeader';
import VideoFilters from '@/components/videos/VideoFilters';
import VideoTable from '@/components/videos/VideoTable';

const { Text } = Typography;

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [genres, setGenres] = useState<{ label: string; value: string }[]>([]);

  const handleSearch = () => {
    setPage(1);
    fetchVideos();
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setGenreFilter('');
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value || '');
  };

  const handleGenreFilterChange = (value: string) => {
    setGenreFilter(value || '');
  };

  const fetchGenres = useCallback(async () => {
    try {
      const res = await adminAPI.getGenres({ limit: 100, isActive: true });
      const data = res.data?.data?.items || res.data?.data || res.data?.items || res.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        setGenres(data.map((g: any) => ({ label: g.name, value: g.name })));
      } else {
        // Fallback genres
        const fallbackGenres = [
          { name: 'Hành động' },
          { name: 'Hài hước' },
          { name: 'Tâm lý' },
          { name: 'Tình cảm' },
          { name: 'Kinh dị' },
          { name: 'Khoa học viễn tưởng' },
          { name: 'Cổ trang' },
          { name: 'Hoạt hình' }
        ];
        setGenres(fallbackGenres.map(g => ({ label: g.name, value: g.name })));
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
      // Fallback genres on error
      const fallbackGenres = [
        { name: 'Hành động' },
        { name: 'Hài hước' },
        { name: 'Tâm lý' },
        { name: 'Tình cảm' },
        { name: 'Kinh dị' },
        { name: 'Khoa học viễn tưởng' },
        { name: 'Cổ trang' },
        { name: 'Hoạt hình' }
      ];
      setGenres(fallbackGenres.map(g => ({ label: g.name, value: g.name })));
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (genreFilter) params.genre = genreFilter;

      const res = await adminAPI.getVideos(params);
      console.log('🎥 Videos API Response:', res.data);
      console.log('🎬 First video genres (videos page):', res.data?.data?.items?.[0]?.genres || res.data?.items?.[0]?.genres);
      const data = res.data?.data || res.data || {};
      setVideos(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching videos:', error);
      message.error('Không thể tải danh sách video');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, genreFilter]);

  useEffect(() => { 
    fetchVideos(); 
  }, [fetchVideos]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Reset effect to trigger fetch
  useEffect(() => {
    if (!search && !statusFilter && !genreFilter) {
      fetchVideos();
    }
  }, [search, statusFilter, genreFilter, fetchVideos]);

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteVideo(id);
      message.success('Đã xóa video');
      fetchVideos();
    } catch {
      message.error('Không thể xóa video');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminAPI.publishVideo(id);
      message.success('Đã xuất bản video');
      fetchVideos();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xuất bản');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await adminAPI.unpublishVideo(id);
      message.success('Đã gỡ xuất bản');
      fetchVideos();
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  return (
    <div>
      <VideoHeader onAdd={() => router.push('/videos/create')} />
      
      <VideoFilters
        search={search}
        statusFilter={statusFilter}
        genreFilter={genreFilter}
        genres={genres}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onGenreFilterChange={handleGenreFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <VideoTable
        videos={videos}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: false,
          showTotal: (t: number) => `Tổng ${t} phim`,
          onChange: (p: number) => setPage(p),
        }}
        onRefresh={fetchVideos}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        showPublishActions={true}
        showManageEpisodes={true}
      />
    </div>
  );
}
