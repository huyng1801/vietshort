'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Spin,
  message,
  Button,
  Card,
  Tag,
  Space,
  Popconfirm,
  Alert,
  Table,
  Tabs,
  Select,
  Collapse,
  Progress,
  Tooltip,
  Empty,
  Badge,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  UploadOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import SubtitleEditor from '@/components/subtitles/SubtitleEditor';
import SubtitleUpload from '@/components/subtitles/SubtitleUpload';
import SubtitleMapping from '@/components/subtitles/SubtitleMapping';
import adminAPI from '@/lib/admin-api';
import { formatDate } from '@/lib/admin-utils';
import type { Subtitle } from '@/types';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  READY: { label: 'Sẵn sàng', color: 'green', icon: <CheckCircleOutlined /> },
  QUEUED: { label: 'Chờ xử lý', color: 'blue', icon: <ClockCircleOutlined /> },
  EXTRACTING: { label: 'Đang trích xuất', color: 'processing', icon: <LoadingOutlined /> },
  TRANSCRIBING: { label: 'Đang phiên âm', color: 'processing', icon: <LoadingOutlined /> },
  TRANSLATING: { label: 'Đang dịch', color: 'processing', icon: <LoadingOutlined /> },
  UPLOADING: { label: 'Đang tải lên', color: 'processing', icon: <LoadingOutlined /> },
  COMPLETED: { label: 'Hoàn thành', color: 'success', icon: <CheckCircleOutlined /> },
  FAILED: { label: 'Thất bại', color: 'error', icon: <ExclamationCircleOutlined /> },
};

const LANGUAGE_LABELS: Record<string, string> = {
  vi: '🇻🇳 Tiếng Việt',
  en: '🇺🇸 English',
};

const LANGUAGE_OPTIONS = [
  { label: '🇻🇳 Tiếng Việt', value: 'vi' },
  { label: '🇺🇸 English', value: 'en' },
];

interface VideoSubtitleData {
  id: string;
  title: string;
  slug: string;
  episodes: Array<{
    id: string;
    episodeNumber: number;
    subtitles: Subtitle[];
  }>;
}

export default function VideoSubtitlePage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [video, setVideo] = useState<VideoSubtitleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSubtitle, setEditingSubtitle] = useState<Subtitle | null>(null);
  const [generatingEpisodeId, setGeneratingEpisodeId] = useState<string | null>(null);
  const [generateLang, setGenerateLang] = useState('vi');
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);

  const fetchVideo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getVideoSubtitles(videoId);
      const data = res.data?.data || res.data;
      setVideo(data);
    } catch (err: any) {
      console.error('Fetch video subtitles error:', err);
      message.error('Không thể tải thông tin phụ đề video');
      router.push('/subtitles');
    } finally {
      setLoading(false);
    }
  }, [videoId, router]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  const handleDeleteSubtitle = async (subtitleId: string) => {
    setDeletingSubId(subtitleId);
    try {
      await adminAPI.deleteSubtitle(subtitleId);
      message.success('Đã xóa phụ đề');
      fetchVideo();
    } catch {
      message.error('Xóa phụ đề thất bại');
    } finally {
      setDeletingSubId(null);
    }
  };

  const handleGenerateAI = async (episodeId: string) => {
    setGeneratingEpisodeId(episodeId);
    try {
      await adminAPI.generateSubtitle(episodeId, { targetLanguage: generateLang });
      message.success('Đã thêm vào hàng đợi xử lý AI');
      fetchVideo();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Tạo phụ đề AI thất bại');
    } finally {
      setGeneratingEpisodeId(null);
    }
  };

  const handleBack = () => {
    router.push('/subtitles');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!video) return null;

  // If we're editing a subtitle, show the editor
  if (editingSubtitle) {
    return (
      <div>
        <div className="page-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setEditingSubtitle(null)}
            style={{ marginBottom: 16 }}
          >
            Quay lại danh sách
          </Button>
          <Title level={3} style={{ marginBottom: 0 }}>
            <EditOutlined className="mr-2" />
            Chỉnh sửa phụ đề — {video.title}
          </Title>
        </div>
        <SubtitleEditor
          subtitleId={editingSubtitle.id}
          content={editingSubtitle.content || ''}
          language={editingSubtitle.language}
          label={editingSubtitle.label}
          onSave={() => {
            setEditingSubtitle(null);
            fetchVideo();
          }}
          onClose={() => setEditingSubtitle(null)}
        />
      </div>
    );
  }

  const episodes = video.episodes || [];
  const totalSubtitles = episodes.reduce((sum, ep) => sum + (ep.subtitles?.length || 0), 0);
  const completedSubtitles = episodes.reduce(
    (sum, ep) => sum + (ep.subtitles?.filter(s => s.status === 'READY' || s.status === 'COMPLETED').length || 0),
    0,
  );
  const processingSubtitles = episodes.reduce(
    (sum, ep) =>
      sum +
      (ep.subtitles?.filter(s =>
        ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'UPLOADING'].includes(s.status),
      ).length || 0),
    0,
  );
  const failedSubtitles = episodes.reduce(
    (sum, ep) => sum + (ep.subtitles?.filter(s => s.status === 'FAILED').length || 0),
    0,
  );

  const subtitleColumns = [
    {
      title: 'Ngôn ngữ',
      key: 'language',
      width: 160,
      render: (_: any, sub: Subtitle) => (
        <Space>
          <GlobalOutlined />
          <span>{LANGUAGE_LABELS[sub.language] || sub.language.toUpperCase()}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 160,
      render: (_: any, sub: Subtitle) => {
        const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.READY;
        return (
          <Space>
            <Tag color={cfg.color} icon={cfg.icon}>
              {cfg.label}
            </Tag>
            {sub.progress > 0 && sub.progress < 100 && (
              <Progress percent={sub.progress} size="small" style={{ width: 60 }} />
            )}
          </Space>
        );
      },
    },
    {
      title: 'Loại',
      key: 'type',
      width: 130,
      render: (_: any, sub: Subtitle) => (
        <Tag color={sub.isAuto ? 'purple' : 'green'}>
          {sub.isAuto ? '🤖 AI' : '📤 Thủ công'}
        </Tag>
      ),
    },
    {
      title: 'Nhãn',
      key: 'label',
      width: 120,
      render: (_: any, sub: Subtitle) =>
        sub.label ? <Tag>{sub.label}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      width: 150,
      render: (_: any, sub: Subtitle) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatDate(sub.createdAt)}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, sub: Subtitle) => {
        const canEdit = (sub.status === 'COMPLETED' || sub.status === 'READY') && sub.content;
        return (
          <Space size={4}>
            {canEdit && (
              <Tooltip title="Chỉnh sửa nội dung">
                <Button
                  size="small"
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setEditingSubtitle(sub)}
                />
              </Tooltip>
            )}
            {sub.srtUrl && (
              <Tooltip title="Xem file SRT">
                <Button
                  size="small"
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(sub.srtUrl, '_blank')}
                />
              </Tooltip>
            )}
            <Popconfirm
              title="Xóa phụ đề này?"
              description="Hành động này không thể hoàn tác"
              onConfirm={() => handleDeleteSubtitle(sub.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button
                  size="small"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deletingSubId === sub.id}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const episodeItems = episodes.map((ep) => {
    const subs = ep.subtitles || [];
    const completedCount = subs.filter(s => s.status === 'READY' || s.status === 'COMPLETED').length;
    const hasProcessing = subs.some(s =>
      ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'UPLOADING'].includes(s.status),
    );
    const hasFailed = subs.some(s => s.status === 'FAILED');

    let statusBadge: 'success' | 'processing' | 'error' | 'default' = 'default';
    if (completedCount > 0) statusBadge = 'success';
    if (hasProcessing) statusBadge = 'processing';
    if (hasFailed) statusBadge = 'error';

    return {
      key: ep.id,
      label: (
        <Space>
          <Badge status={statusBadge} />
          <span style={{ fontWeight: 500 }}>Tập {ep.episodeNumber}</span>
          <Tag>{subs.length} phụ đề</Tag>
          {completedCount > 0 && (
            <Tag color="success">{completedCount} hoàn thành</Tag>
          )}
          {hasProcessing && <Tag color="processing">Đang xử lý</Tag>}
          {hasFailed && <Tag color="error">Có lỗi</Tag>}
        </Space>
      ),
      children: (
        <div>
          {subs.length > 0 ? (
            <>
              <Table
                columns={subtitleColumns}
                dataSource={subs}
                rowKey="id"
                pagination={false}
                size="small"
              />
              {subs.some(s => s.error) && (
                <div style={{ marginTop: 8 }}>
                  {subs.filter(s => s.error).map(s => (
                    <Alert
                      key={s.id}
                      type="error"
                      showIcon
                      style={{ marginBottom: 4 }}
                      message={`Lỗi phụ đề ${LANGUAGE_LABELS[s.language] || s.language}: ${s.error}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Empty
              description="Chưa có phụ đề cho tập này"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {/* Generate AI subtitle for this episode */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
            <Space>
              <Select
                value={generateLang}
                onChange={setGenerateLang}
                options={LANGUAGE_OPTIONS}
                style={{ width: 180 }}
                size="small"
              />
              <Popconfirm
                title="Tạo phụ đề AI?"
                description={`Hệ thống sẽ dùng Whisper để tạo phụ đề ${LANGUAGE_LABELS[generateLang]} cho tập ${ep.episodeNumber}`}
                onConfirm={() => handleGenerateAI(ep.id)}
                okText="Tạo"
                cancelText="Hủy"
              >
                <Button
                  size="small"
                  icon={<ThunderboltOutlined />}
                  loading={generatingEpisodeId === ep.id}
                >
                  Tạo phụ đề AI
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </div>
      ),
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ marginBottom: 0 }}>
            <FileTextOutlined className="mr-2" />
            {video.title}
          </Title>
          <Button icon={<ReloadOutlined />} onClick={fetchVideo}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Video Info Card */}
      <Card style={{ marginBottom: 24 }} size="small">
        <Space size="large" wrap>
          <Space>
            <VideoCameraOutlined style={{ fontSize: 18, color: '#1890ff' }} />
            <div>
              <Text strong style={{ fontSize: 14 }}>{video.title}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>{episodes.length} tập phim</Text>
            </div>
          </Space>
          <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
            <span>
              <Badge status="success" /> <span style={{ fontSize: 13 }}>{completedSubtitles} hoàn thành</span>
            </span>
            {processingSubtitles > 0 && (
              <span>
                <Badge status="processing" /> <span style={{ fontSize: 13 }}>{processingSubtitles} đang xử lý</span>
              </span>
            )}
            {failedSubtitles > 0 && (
              <span>
                <Badge status="error" /> <span style={{ fontSize: 13 }}>{failedSubtitles} lỗi</span>
              </span>
            )}
            <span style={{ fontSize: 13 }}>
              Tổng: <strong>{totalSubtitles}</strong> phụ đề
            </span>
          </Space>
        </Space>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="list"
        type="card"
        size="large"
        destroyInactiveTabPane
        items={[
          {
            key: 'list',
            label: (
              <Space size={6}>
                <FileTextOutlined />
                <span>Danh sách phụ đề ({totalSubtitles})</span>
              </Space>
            ),
            children: episodes.length > 0 ? (
              <Collapse
                defaultActiveKey={episodes.slice(0, 3).map(e => e.id)}
                items={episodeItems}
              />
            ) : (
              <Empty description="Video chưa có tập phim nào" />
            ),
          },
          {
            key: 'upload',
            label: (
              <Space size={6}>
                <UploadOutlined />
                <span>Tải phụ đề</span>
              </Space>
            ),
            children: episodes.length > 0 ? (
              <SubtitleUpload
                videoId={videoId}
                episodes={episodes.map(ep => ({
                  id: ep.id,
                  episodeNumber: ep.episodeNumber,
                }))}
                onSuccess={fetchVideo}
              />
            ) : (
              <Empty description="Video chưa có tập phim nào" />
            ),
          },
          {
            key: 'bulk',
            label: (
              <Space size={6}>
                <ThunderboltOutlined />
                <span>Upload hàng loạt</span>
              </Space>
            ),
            children: episodes.length > 0 ? (
              <SubtitleMapping
                videoId={videoId}
                episodes={episodes.map(ep => ({
                  id: ep.id,
                  episodeNumber: ep.episodeNumber,
                }))}
                onSuccess={fetchVideo}
              />
            ) : (
              <Empty description="Video chưa có tập phim nào" />
            ),
          },
        ]}
      />
    </div>
  );
}
