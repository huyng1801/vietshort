'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography, Spin, message, Button, Tabs, Card, Table, Tag,
  Space, Popconfirm, Select, Progress, Tooltip, Badge, Empty,
} from 'antd';
import {
  ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined,
  RobotOutlined, ReloadOutlined, SoundOutlined, CheckCircleOutlined,
  LoadingOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import SubtitleUpload from '@/components/subtitles/SubtitleUpload';
import SubtitleEditor from '@/components/subtitles/SubtitleEditor';
import SubtitleMapping from '@/components/subtitles/SubtitleMapping';
import adminAPI from '@/lib/admin-api';
import type { Video, Episode, Subtitle, SubtitleStatusType } from '@/types/admin';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<SubtitleStatusType, { color: string; label: string; icon?: React.ReactNode }> = {
  READY: { color: 'green', label: 'Sẵn sàng', icon: <CheckCircleOutlined /> },
  QUEUED: { color: 'blue', label: 'Chờ xử lý' },
  EXTRACTING: { color: 'purple', label: 'Trích xuất âm thanh', icon: <LoadingOutlined /> },
  TRANSCRIBING: { color: 'purple', label: 'Nhận dạng giọng nói', icon: <SoundOutlined spin /> },
  TRANSLATING: { color: 'orange', label: 'Đang dịch', icon: <LoadingOutlined /> },
  UPLOADING: { color: 'cyan', label: 'Đang tải lên', icon: <LoadingOutlined /> },
  COMPLETED: { color: 'success', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
  FAILED: { color: 'error', label: 'Lỗi', icon: <ExclamationCircleOutlined /> },
};

const LANGUAGES = [
  { label: '🇻🇳 Tiếng Việt', value: 'vi' },
  { label: '🇺🇸 English', value: 'en' },
];

export default function SubtitleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSubtitle, setEditingSubtitle] = useState<Subtitle | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState('vi');

  const fetchVideo = useCallback(async () => {
    try {
      const res = await adminAPI.getVideoSubtitles(videoId);
      setVideo(res.data);
    } catch {
      message.error('Không thể tải video');
      router.push('/subtitles');
    } finally {
      setLoading(false);
    }
  }, [videoId, router]);

  useEffect(() => { fetchVideo(); }, [fetchVideo]);

  // Poll for progress while any subtitle is processing
  useEffect(() => {
    if (!video) return;
    const episodes = video.episodes || [];
    const hasProcessing = episodes.some((ep: any) =>
      ep.subtitles?.some((s: any) =>
        ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'UPLOADING'].includes(s.status),
      ),
    );
    if (!hasProcessing) return;

    const interval = setInterval(fetchVideo, 5000);
    return () => clearInterval(interval);
  }, [video, fetchVideo]);

  const handleDelete = async (subtitleId: string) => {
    setDeleting(subtitleId);
    try {
      await adminAPI.deleteSubtitle(subtitleId);
      message.success('Đã xóa phụ đề');
      fetchVideo();
    } catch {
      message.error('Xóa thất bại');
    } finally {
      setDeleting(null);
    }
  };

  const handleGenerate = async (episodeId: string) => {
    setGenerating(episodeId);
    try {
      await adminAPI.generateSubtitle(episodeId, { targetLanguage: selectedLang });
      message.success('Đã thêm vào hàng đợi AI');
      fetchVideo();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo phụ đề AI');
    } finally {
      setGenerating(null);
    }
  };

  const handleEditSubtitle = async (subtitleId: string) => {
    try {
      const res = await adminAPI.getSubtitle(subtitleId);
      setEditingSubtitle(res.data);
      setActiveTab('editor');
    } catch {
      message.error('Không thể tải nội dung phụ đề');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }
  if (!video) return null;

  const episodes: any[] = video.episodes || [];

  // ─── Episode Subtitles Table ───
  const episodeColumns = [
    {
      title: 'Tập',
      key: 'episode',
      width: 100,
      render: (_: any, ep: any) => (
        <Text strong>Tập {ep.episodeNumber}</Text>
      ),
    },
    {
      title: 'Phụ đề',
      key: 'subtitles',
      render: (_: any, ep: any) => {
        const subs: Subtitle[] = ep.subtitles || [];
        if (subs.length === 0) return <Text type="secondary">Chưa có phụ đề</Text>;

        return (
          <Space wrap size={[4, 4]}>
            {subs.map((sub) => {
              const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.READY;
              const isProcessing = ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'UPLOADING'].includes(sub.status);

              return (
                <Tooltip
                  key={sub.id}
                  title={
                    <div>
                      <div>{sub.label || sub.language} — {cfg.label}</div>
                      {isProcessing && <div>Tiến độ: {sub.progress}%</div>}
                      {sub.error && <div style={{ color: '#ff7875' }}>Lỗi: {sub.error}</div>}
                      {sub.isAuto && <div>🤖 Tạo bởi AI</div>}
                    </div>
                  }
                >
                  <Tag color={cfg.color} style={{ cursor: 'pointer', marginBottom: 0 }}>
                    {cfg.icon} {sub.language.toUpperCase()}
                    {isProcessing && ` ${sub.progress}%`}
                  </Tag>
                </Tooltip>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: any, ep: any) => {
        const subs: Subtitle[] = ep.subtitles || [];
        return (
          <Space size={4} wrap>
            {subs.map((sub) => {
              const isProcessing = ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'UPLOADING'].includes(sub.status);
              if (isProcessing) {
                return (
                  <Progress
                    key={sub.id}
                    type="circle"
                    size={30}
                    percent={sub.progress}
                    strokeColor="#722ed1"
                  />
                );
              }
              return (
                <Space key={sub.id} size={2}>
                  <Tooltip title={`Sửa ${sub.language}`}>
                    <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEditSubtitle(sub.id)} />
                  </Tooltip>
                  <Popconfirm title={`Xóa phụ đề ${sub.language}?`} onConfirm={() => handleDelete(sub.id)}>
                    <Tooltip title={`Xóa ${sub.language}`}>
                      <Button size="small" type="text" danger icon={<DeleteOutlined />} loading={deleting === sub.id} />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              );
            })}

            <Tooltip title="Tạo phụ đề AI (Whisper)">
              <Button
                size="small"
                type="link"
                icon={<RobotOutlined />}
                style={{ color: '#722ed1' }}
                onClick={() => handleGenerate(ep.id)}
                loading={generating === ep.id}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Tooltip title="Quay lại">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/subtitles')} />
        </Tooltip>
        <Title level={3} style={{ margin: 0 }}>Phụ đề: {video.title}</Title>
        <div style={{ marginLeft: 'auto' }}>
          <Space>
            <span>Ngôn ngữ AI:</span>
            <Select
              value={selectedLang}
              onChange={setSelectedLang}
              options={LANGUAGES}
              style={{ width: 180 }}
              size="small"
            />
          </Space>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                Tổng quan
                <Badge
                  count={episodes.reduce((a: number, ep: any) => a + (ep.subtitles?.length || 0), 0)}
                  style={{ marginLeft: 8, backgroundColor: '#52c41a' }}
                  showZero
                />
              </span>
            ),
            children: (
              <Table
                columns={episodeColumns}
                dataSource={episodes}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{ emptyText: <Empty description="Video chưa có tập phim nào" /> }}
              />
            ),
          },
          {
            key: 'upload',
            label: 'Tải lên SRT',
            children: (
              <SubtitleUpload
                videoId={videoId}
                episodes={episodes}
                onSuccess={fetchVideo}
              />
            ),
          },
          {
            key: 'editor',
            label: editingSubtitle ? `Sửa: ${editingSubtitle.language}` : 'Chỉnh sửa',
            children: editingSubtitle ? (
              <SubtitleEditor
                subtitleId={editingSubtitle.id}
                content={editingSubtitle.content || ''}
                language={editingSubtitle.language}
                label={editingSubtitle.label}
                onSave={() => {
                  fetchVideo();
                  message.success('Đã lưu phụ đề');
                }}
                onClose={() => {
                  setEditingSubtitle(null);
                  setActiveTab('overview');
                }}
              />
            ) : (
              <Card>
                <Empty description="Chọn phụ đề cần chỉnh sửa từ tab Tổng quan (nhấn nút ✏️)" />
              </Card>
            ),
          },
          {
            key: 'bulk',
            label: 'Upload hàng loạt',
            children: (
              <SubtitleMapping
                videoId={videoId}
                episodes={episodes}
                onSuccess={fetchVideo}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
