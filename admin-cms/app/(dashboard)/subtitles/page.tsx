'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Space, message, Table, Tag, Input, Card, Statistic, Row, Col, Progress, Badge, Tooltip, Select } from 'antd';
import { ReloadOutlined, SearchOutlined, SoundOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, FormOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { SubtitleQueueStatus, SubtitleStatusType } from '@/types';
import SubtitleFilters from '@/components/subtitles/SubtitleFilters';

const SUBTITLE_STATUS_MAP: Record<SubtitleStatusType, { color: string; label: string }> = {
  READY: { color: 'green', label: 'Sẵn sàng' },
  QUEUED: { color: 'blue', label: 'Chờ xử lý' },
  EXTRACTING: { color: 'processing', label: 'Trích xuất' },
  TRANSCRIBING: { color: 'processing', label: 'Nhận dạng' },
  TRANSLATING: { color: 'processing', label: 'Dịch' },
  UPLOADING: { color: 'processing', label: 'Đang tải' },
  COMPLETED: { color: 'success', label: 'Hoàn thành' },
  FAILED: { color: 'error', label: 'Lỗi' },
};

export default function SubtitlesPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [subtitleStatusFilter, setSubtitleStatusFilter] = useState<string>('');
  const [videoTypeFilter, setVideoTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [genres, setGenres] = useState<{ label: string; value: string }[]>([]);
  const [queueStatus, setQueueStatus] = useState<SubtitleQueueStatus | null>(null);
  const { params, setParams, handleTableChange, paginationConfig } = usePagination();

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setSearch('');
    setSubtitleStatusFilter('');
    setVideoTypeFilter('');
    setStatusFilter('');
    setGenreFilter('');
    setParams((prev) => ({ ...prev, page: 1 }));
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
      const queryParams: any = { ...params, search: search || undefined };
      
      // Filter by subtitle status
      if (subtitleStatusFilter) {
        queryParams.subtitleStatus = subtitleStatusFilter;
      }
      
      // Filter by video type
      if (videoTypeFilter) {
        queryParams.isSerial = videoTypeFilter === 'SERIAL';
      }

      // Filter by status (DRAFT, PUBLISHED, ARCHIVED)
      if (statusFilter) {
        queryParams.status = statusFilter;
      }

      // Filter by genre
      if (genreFilter) {
        queryParams.genre = genreFilter;
      }

      const res = await adminAPI.getSubtitlesOverview(queryParams);
      console.log('🔍 Subtitles API Response:', res.data);
      console.log('🎬 First video genres:', res.data.items?.[0]?.genres || res.data?.data?.items?.[0]?.genres);
      
      // Handle both response formats (with or without wrapper)
      const data = res.data?.data || res.data || {};
      setVideos(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Subtitle page fetch error:', err);
      message.error((err as any)?.response?.data?.message || 'Không thể tải danh sách video');
    } finally {
      setLoading(false);
    }
  }, [params, search, subtitleStatusFilter, videoTypeFilter, statusFilter, genreFilter]);

  const fetchQueueStatus = useCallback(async () => {
    try {
      const res = await adminAPI.getSubtitleQueueStatus();
      setQueueStatus(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);
  useEffect(() => { fetchGenres(); }, [fetchGenres]);
  useEffect(() => { fetchQueueStatus(); const t = setInterval(fetchQueueStatus, 10000); return () => clearInterval(t); }, [fetchQueueStatus]);

  const columns = [
    {
      title: 'Video',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      ellipsis: true,
      render: (title: string, record: any) => (
        <Space>
          {record.poster && (
            <img src={record.poster} alt="" style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4 }} />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{title}</div>
            <Space size={4} style={{ fontSize: 12, color: '#888' }}>
              <span>{record.isSerial ? `${record._count?.episodes || 0} tập` : 'Phim lẻ'}</span>
              {record.releaseYear && <span>• {record.releaseYear}</span>}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Thể loại',
      dataIndex: 'genres',
      key: 'genres',
      width: 180,
      render: (genres: string | undefined, record: any) => {
        console.log('🎯 Genre value for', record.title, ':', genres, 'Type:', typeof genres);
        if (!genres) return <Tag color="orange">Chưa có</Tag>;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {genres.split(',').map((g, idx) => (
              <Tag key={idx} color="blue" style={{ marginRight: 0 }}>{g.trim()}</Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Tập phim',
      key: 'episodes',
      width: 400,
      render: (_: any, record: any) => {
        const episodes = record.episodes || [];
        if (episodes.length === 0) return <Tag color="orange">Chưa có tập</Tag>;

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {episodes.slice(0, 10).map((ep: any) => {
              const subs = ep.subtitles || [];
              const hasCompleted = subs.some((s: any) => s.status === 'READY' || s.status === 'COMPLETED');
              const hasProcessing = subs.some((s: any) => ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'UPLOADING'].includes(s.status));
              const hasFailed = subs.some((s: any) => s.status === 'FAILED');

              let color = 'default';
              if (hasCompleted) color = 'success';
              if (hasProcessing) color = 'processing';
              if (hasFailed) color = 'error';

              return (
                <Tag key={ep.id} color={color} style={{ marginBottom: 0 }}>
                  Tập {ep.episodeNumber}
                  {subs.length > 0 && ` (${subs.length})`}
                </Tag>
              );
            })}
            {episodes.length > 10 && <Tag>+{episodes.length - 10} tập</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Phụ đề',
      key: 'subtitleCount',
      width: 120,
      render: (_: any, record: any) => {
        const episodes = record.episodes || [];
        const totalSubs = episodes.reduce((acc: number, ep: any) => acc + (ep.subtitles?.length || 0), 0);
        const completedSubs = episodes.reduce(
          (acc: number, ep: any) => acc + (ep.subtitles?.filter((s: any) => s.status === 'READY' || s.status === 'COMPLETED').length || 0), 0,
        );

        return (
          <Space orientation="vertical" size={0} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{totalSubs}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{completedSubs} hoàn thành</span>
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 60,
      render: (_: any, record: any) => (
        <Tooltip title="Chỉnh sửa phụ đề">
          <Button
            type="link"
            size="small"
            icon={<FormOutlined />}
            onClick={() => router.push(`/subtitles/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Quản lý phụ đề</h1>
      </div>

    

      <SubtitleFilters
        search={search}
        subtitleStatusFilter={subtitleStatusFilter}
        videoTypeFilter={videoTypeFilter}
        statusFilter={statusFilter}
        genreFilter={genreFilter}
        genres={genres}
        onSearchChange={setSearch}
        onSubtitleStatusFilterChange={setSubtitleStatusFilter}
        onVideoTypeFilterChange={setVideoTypeFilter}
        onStatusFilterChange={setStatusFilter}
        onGenreFilterChange={setGenreFilter}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <Table
        columns={columns}
        dataSource={videos}
        loading={loading}
        rowKey="id"
        pagination={{ 
          ...paginationConfig, 
          total,
          showTotal: (total: number) => `Tổng ${total} video`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}
