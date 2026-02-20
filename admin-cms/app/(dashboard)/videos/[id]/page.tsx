'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography, Spin, message, Card, Form, Input, Button, Space,
  InputNumber, Table, Tag, Popconfirm, Progress, Modal, Upload, Tabs, Tooltip,
  Row, Col, Divider, Image, Rate, Statistic,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, UploadOutlined,
  PlayCircleOutlined, ReloadOutlined, DeleteOutlined, CloudUploadOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { io, Socket } from 'socket.io-client';
import type { Video, Episode } from '@/types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ENCODING_COLORS: Record<string, string> = {
  PENDING: 'default',
  QUEUED: 'blue',
  PROCESSING: 'processing',
  COMPLETED: 'green',
  FAILED: 'red',
};

const ENCODING_STATUS_VN: Record<string, string> = {
  PENDING: 'Chờ tải lên',
  QUEUED: 'Chờ mã hóa',
  PROCESSING: 'Đang mã hóa',
  COMPLETED: 'Hoàn thành',
  FAILED: 'Lỗi mã hóa',
};

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Episode creation modal
  const [epModalOpen, setEpModalOpen] = useState(false);
  const [epForm] = Form.useForm();
  const [creatingEp, setCreatingEp] = useState(false);

  // Upload state per episode
  const [uploadingEpId, setUploadingEpId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete state per episode
  const [deletingEp, setDeletingEp] = useState<string | null>(null);

  // Socket for encoding progress
  const socketRef = useRef<Socket | null>(null);

  const fetchVideo = useCallback(async () => {
    try {
      const res = await adminAPI.getVideo(videoId);
      const data = res.data?.data || res.data;
      setVideo(data);
      setEpisodes(data.episodes || []);
    } catch {
      message.error('Không thể tải thông tin video');
      router.push('/videos');
    } finally {
      setLoading(false);
    }
  }, [videoId, router]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  // Socket.io for live encoding progress
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('encoding:progress', (data: { episodeId: string; progress: number }) => {
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.id === data.episodeId ? { ...ep, encodingProgress: data.progress, encodingStatus: 'PROCESSING' } : ep,
        ),
      );
    });

    socket.on('encoding:completed', (data: { episodeId: string }) => {
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.id === data.episodeId ? { ...ep, encodingStatus: 'COMPLETED', encodingProgress: 100 } : ep,
        ),
      );
      message.success('Mã hóa hoàn tất!');
    });

    socket.on('encoding:failed', (data: { episodeId: string; error: string }) => {
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.id === data.episodeId ? { ...ep, encodingStatus: 'FAILED', encodingError: data.error } : ep,
        ),
      );
      message.error(`Mã hóa thất bại: ${data.error}`);
    });

    return () => { socket.disconnect(); };
  }, []);

  const handleSaveMetadata = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (Array.isArray(values.genres)) {
        values.genres = (values.genres as string[]).join(',');
      }
      await adminAPI.updateVideo(videoId, values);
      message.success('Đã lưu thông tin phim');
    } catch {
      message.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Create episode
  const handleCreateEpisode = async (values: { episodeNumber: number; title?: string; unlockPrice?: number }) => {
    setCreatingEp(true);
    try {
      const res = await adminAPI.createEpisode(videoId, values);
      const newEp = res.data?.data || res.data;
      setEpisodes((prev) => [...prev, newEp]);
      message.success('Đã tạo tập mới');
      epForm.resetFields();
      setEpModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tạo tập thất bại');
    } finally {
      setCreatingEp(false);
    }
  };

  const handleUploadEpisode = async (episodeId: string, file: File) => {
    setUploadingEpId(episodeId);
    setUploadProgress(0);
    try {
      // Get presigned URL
      const urlRes = await adminAPI.getEpisodeUploadUrl(episodeId, file.type || 'video/mp4');
      const { uploadUrl } = urlRes.data?.data || urlRes.data;

      // Upload directly to R2
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Upload error'));
        xhr.send(file);
      });

      message.success('Upload hoàn tất! Bắt đầu mã hóa...');

      // Step 4: Trigger encode
      await adminAPI.processEpisode(episodeId);
      setEpisodes((prev) =>
        prev.map((ep) => (ep.id === episodeId ? { ...ep, encodingStatus: 'QUEUED', encodingProgress: 0, sourceUrl: 'uploaded' } : ep)),
      );
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploadingEpId(null);
      setUploadProgress(0);
    }
  };

  // Step 5: Reprocess failed episode
  const handleReprocess = async (episodeId: string) => {
    try {
      await adminAPI.reprocessEpisode(episodeId);
      setEpisodes((prev) =>
        prev.map((ep) => (ep.id === episodeId ? { ...ep, encodingStatus: 'QUEUED', encodingProgress: 0, encodingError: undefined } : ep)),
      );
      message.success('Đã đưa vào hàng đợi mã hóa lại');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xử lý lại');
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!episodeId) {
      message.error('ID tập không hợp lệ');
      return;
    }

    try {
      setDeletingEp(episodeId);
      await adminAPI.deleteEpisode(episodeId);
      setEpisodes((prev) => prev.filter((ep) => ep.id !== episodeId));
      message.success('✓ Đã xóa tập thành công!');
    } catch (err: any) {
      console.error('Delete episode error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Xóa tập thất bại';
      message.error(errorMessage);
    } finally {
      setDeletingEp(null);
    }
  };

  // Step 8: Publish / Unpublish
  const handlePublish = async () => {
    try {
      await adminAPI.publishVideo(videoId);
      setVideo((v) => v ? { ...v, status: 'PUBLISHED' } : v);
      message.success('Đã xuất bản phim');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xuất bản');
    }
  };

  const handleUnpublish = async () => {
    try {
      await adminAPI.unpublishVideo(videoId);
      setVideo((v) => v ? { ...v, status: 'DRAFT' } : v);
      message.success('Đã gỡ xuất bản');
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!video) return null;

  const completedEpisodes = episodes.filter((ep) => ep.encodingStatus === 'COMPLETED').length;
  const canPublish = video.status === 'DRAFT' && completedEpisodes > 0;

  const episodeColumns = [
    {
      title: 'Tập',
      dataIndex: 'episodeNumber',
      key: 'episodeNumber',
      width: 60,
      sorter: (a: Episode, b: Episode) => a.episodeNumber - b.episodeNumber,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (t: string, rec: Episode) => t || `Tập ${rec.episodeNumber}`,
    },
    {
      title: 'Trạng thái mã hóa',
      key: 'encoding',
      width: 200,
      render: (_: unknown, ep: Episode) => (
        <div>
          <Tag color={ENCODING_COLORS[ep.encodingStatus] || 'default'}>
            {ENCODING_STATUS_VN[ep.encodingStatus] || ep.encodingStatus}
          </Tag>
          {ep.encodingStatus === 'PROCESSING' && (
            <Progress percent={ep.encodingProgress || 0} size="small" style={{ width: 100, display: 'inline-block', marginLeft: 8 }} />
          )}
          {ep.encodingStatus === 'FAILED' && ep.encodingError && (
            <Text type="danger" style={{ fontSize: 11, display: 'block' }}>{ep.encodingError}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Giá (Xu)',
      dataIndex: 'unlockPrice',
      key: 'price',
      width: 100,
      render: (p: number | null) => (p ? `${p} Xu` : 'Miễn phí'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: unknown, ep: Episode) => (
        <Space size="small" wrap>
          {/* Upload button: only for PENDING or FAILED */}
          {(ep.encodingStatus === 'PENDING' || ep.encodingStatus === 'FAILED') && (
            <Upload
              accept="video/*"
              showUploadList={false}
              beforeUpload={(file) => { handleUploadEpisode(ep.id, file); return false; }}
            >
              <Tooltip title={uploadingEpId === ep.id ? `Đang tải lên ${uploadProgress}%` : 'Tải lên'}>
                <Button
                  size="small"
                  icon={<CloudUploadOutlined />}
                  loading={uploadingEpId === ep.id}
                  type="text"
                  className="hover:!bg-transparent"
                />
              </Tooltip>
            </Upload>
          )}
          {/* Reprocess button: only for FAILED */}
          {ep.encodingStatus === 'FAILED' && ep.sourceUrl && (
            <Tooltip title="Mã hóa lại">
              <Button 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={() => handleReprocess(ep.id)}
                type="text"
                className="hover:!bg-transparent"
              />
            </Tooltip>
          )}
          {/* Preview/Play: only for COMPLETED */}
          {ep.encodingStatus === 'COMPLETED' && ep.hlsManifest && (
            <Tooltip title="Xem">
              <Button 
                size="small" 
                icon={<PlayCircleOutlined />} 
                onClick={() => window.open(ep.hlsManifest!, '_blank')}
                type="text"
                className="hover:!bg-transparent"
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa tập này?"
            onConfirm={() => handleDeleteEpisode(ep.id)}
            okButtonProps={{ danger: true, loading: deletingEp === ep.id }}
            okText="Xóa"
            cancelText="Hủy"
            placement="topRight"
          >
            <Tooltip title="Xóa">
              <Button 
                type="link" 
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deletingEp === ep.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/videos')}>Quay lại</Button>
          <Title level={3} style={{ margin: 0 }}>{video.title}</Title>
          <Tag color={video.status === 'PUBLISHED' ? 'green' : video.status === 'DRAFT' ? 'default' : 'orange'}>
            {video.status}
          </Tag>
        </Space>
        <Space>
          {canPublish && (
            <Popconfirm title="Xuất bản phim này?" onConfirm={handlePublish}>
              <Button type="primary">Xuất bản</Button>
            </Popconfirm>
          )}
          {video.status === 'PUBLISHED' && (
            <Popconfirm title="Gỡ xuất bản?" onConfirm={handleUnpublish}>
              <Button>Gỡ xuất bản</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Card
        title="Thông tin chung"
        style={{ marginBottom: 24 }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <Row gutter={[16, 12]}>
          {/* Poster */}
          {video.poster && (
            <Col xs={24} sm={6} md={4}>
              <Image
                src={video.poster}
                alt={video.title}
                style={{ borderRadius: 4, maxWidth: '100%', height: 'auto' }}
                preview
                width={250}
              />
            </Col>
          )}
          
          {/* Video statistics & metadata - compact */}
          <Col xs={24} sm={video.poster ? 18 : 24} md={video.poster ? 20 : 24}>
            <Row gutter={[16, 8]}>
              {/* Key statistics */}
              <Col xs={6} sm={4}>
                <div style={{ textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{video.viewCount || 0}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>👁️ Xem</div>
                </div>
              </Col>
              <Col xs={6} sm={4}>
                <div style={{ textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{video.likeCount || 0}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>❤️ Thích</div>
                </div>
              </Col>
              <Col xs={6} sm={4}>
                <div style={{ textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{video.commentCount || 0}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>💬 BL</div>
                </div>
              </Col>
              <Col xs={6} sm={4}>
                <div style={{ textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {video.ratingCount > 0 ? video.ratingAverage.toFixed(1) : '—'}
                  </div>
                  <div style={{ color: '#999', fontSize: 11 }}>⭐ Rating</div>
                </div>
              </Col>
              <Col xs={6} sm={4}>
                <div style={{ textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>{episodes.length}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>🎬 Tập</div>
                </div>
              </Col>
              <Col xs={6} sm={4}>
                <div style={{ textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {video.duration ? `${Math.round(video.duration / 60)}p` : '—'}
                  </div>
                  <div style={{ color: '#999', fontSize: 11 }}>⏱️ Thời gian</div>
                </div>
              </Col>

              {/* Metadata inline */}
              <Col xs={24}>
                <div style={{ fontSize: 13, lineHeight: '1.6' }}>
                  {video.releaseYear && (
                    <span style={{ marginRight: 20 }}>
                      <span style={{ color: '#999' }}>📅</span> {video.releaseYear}
                    </span>
                  )}
                  {video.ageRating && (
                    <span style={{ marginRight: 20 }}>
                      <span style={{ color: '#999' }}>🔞</span> {video.ageRating}
                    </span>
                  )}
                  {video.isVipOnly && (
                    <Tag color="gold" style={{ marginRight: 8 }}>VIP Only</Tag>
                  )}
                  {video.director && (
                    <span style={{ marginRight: 20 }}>
                      <span style={{ color: '#999' }}>🎥</span> {video.director}
                    </span>
                  )}
                  {video.country && (
                    <span style={{ marginRight: 20 }}>
                      <span style={{ color: '#999' }}>🌍</span> {video.country}
                    </span>
                  )}
                  {video.language && (
                    <span>
                      <span style={{ color: '#999' }}>🗣️</span> {video.language}
                    </span>
                  )}
                </div>
              </Col>

              {/* Genres */}
              {video.genres && (
                <Col xs={24}>
                  <div style={{ fontSize: 11 }}>
                    {video.genres.split(',').map((genre, idx) => (
                      <Tag key={idx} style={{ marginRight: 4, marginBottom: 4 }}>
                        {genre.trim()}
                      </Tag>
                    ))}
                  </div>
                </Col>
              )}

              {/* Short description */}
              {video.description && (
                <Col xs={24}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    📝 Mô tả
                  </Text>
                  <Paragraph 
                    ellipsis={{ rows: 2 }} 
                    style={{ margin: 0, fontSize: 12 }}
                  >
                    {video.description}
                  </Paragraph>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </Card>

      <Card
        title={`Danh sách tập — ${completedEpisodes}/${episodes.length} đã mã hóa`}
        extra={(
          <Button icon={<PlusOutlined />} type="primary" onClick={() => {
            epForm.setFieldsValue({ episodeNumber: episodes.length + 1 });
            setEpModalOpen(true);
          }}>
            Thêm tập
          </Button>
        )}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          📢 <b>Ghi chú:</b> Để thay đổi thông tin phim hoặc poster, vui lòng thực hiện tại danh sách video ngoài trang chủ.
        </Text>
        <Table
          dataSource={episodes}
          columns={episodeColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Create Episode Modal */}
      <Modal
        title="Thêm tập mới"
        open={epModalOpen}
        onCancel={() => setEpModalOpen(false)}
        onOk={() => epForm.submit()}
        confirmLoading={creatingEp}
        okText="Tạo mới"
        cancelText="Hủy"
        width={600}
        destroyOnHidden
        maskClosable={!creatingEp}
        centered
      >
        <Form form={epForm} layout="vertical" onFinish={handleCreateEpisode}>
          <Form.Item name="episodeNumber" label="Số tập" rules={[{ required: true, message: 'Vui lòng nhập số tập' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="title" label="Tiêu đề tập (tùy chọn)">
            <Input placeholder="VD: Khởi đầu mới" />
          </Form.Item>
          <Form.Item name="unlockPrice" label="Giá mở khoá (Xu)">
            <InputNumber min={0} placeholder="0 = miễn phí" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
