'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Space, Avatar, Typography, Popconfirm, message, Tooltip, Upload, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, VideoCameraOutlined, LoadingOutlined, CameraOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Video } from '@/types';
import { formatDate, formatNumber, getStatusColor, getStatusText, truncateText } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

interface VideoTableProps {
  videos?: Video[];
  loading?: boolean;
  pagination?: object;
  onChange?: (pagination: object, filters: unknown, sorter: unknown) => void;
  onRefresh?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  onPublish?: (id: string) => Promise<void>;
  onUnpublish?: (id: string) => Promise<void>;
  showPublishActions?: boolean;
  showManageEpisodes?: boolean;
}

export default function VideoTable({
  videos = [],
  loading,
  pagination,
  onChange,
  onRefresh,
  onEdit,
  onDelete: onDeleteCallback,
  onPublish,
  onUnpublish,
  showPublishActions = false,
  showManageEpisodes = false,
}: VideoTableProps) {
  const router = useRouter();
  const videoList = Array.isArray(videos) ? videos : [];
  const [uploadingPosterId, setUploadingPosterId] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<{ visible: boolean; url: string; videoId: string }>({ visible: false, url: '', videoId: '' });
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!id) {
      message.error('ID video không hợp lệ');
      return;
    }

    try {
      setDeleting(id);
      if (onDeleteCallback) {
        await onDeleteCallback(id);
      } else {
        await adminAPI.deleteVideo(id);
      }
      message.success('✓ Đã xóa video thành công!');
      onRefresh?.();
    } catch (error: any) {
      console.error('Delete video error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Xóa video thất bại';
      message.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const handlePosterUpload = async (file: File, videoId: string) => {
    setUploadingPosterId(videoId);
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        setUploadingPosterId(null);
        return;
      }

      // Get presigned URL for poster
      const urlRes = await adminAPI.getPosterUploadUrl(videoId, file.type || 'image/jpeg');
      const responseData = urlRes.data?.data || urlRes.data;
      
      if (!responseData?.uploadUrl) {
        throw new Error('Không nhận được URL upload từ server');
      }

      const { uploadUrl, publicUrl } = responseData;

      // Upload to R2 using XMLHttpRequest for better error handling
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });

      // Update video with new poster URL
      if (publicUrl) {
        await adminAPI.updatePoster(videoId, publicUrl);
        message.success('Cập nhật poster thành công!');
        onRefresh?.();
      } else {
        throw new Error('Không nhận được public URL từ server');
      }
    } catch (error: any) {
      console.error('Upload poster error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Upload poster thất bại';
      message.error(errorMsg);
    } finally {
      setUploadingPosterId(null);
    }
  };

  const columns = [
    {
      title: 'Video',
      key: 'video',
      width: 320,
      render: (_: unknown, record: Video) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handlePosterUpload(file, record.id);
                return false;
              }}
              accept="image/*"
            >
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Avatar
                  shape="square"
                  size={64}
                  src={record.poster}
                  style={{ flexShrink: 0, borderRadius: 4 }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  borderRadius: 4,
                  pointerEvents: uploadingPosterId === record.id ? 'none' : 'auto',
                }} 
                className="poster-upload-overlay"
                >
                  {uploadingPosterId === record.id ? (
                    <LoadingOutlined style={{ fontSize: 24, color: '#fff' }} />
                  ) : (
                    <CameraOutlined style={{ fontSize: 24, color: '#fff' }} />
                  )}
                </div>
              </div>
            </Upload>
          </div>
          <div>
            <Typography.Text strong ellipsis style={{ maxWidth: 220, display: 'block' }}>
              {record.title}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.isSerial ? 'Phim bộ' : 'Phim lẻ'}
              {record._count?.episodes ? ` · ${record._count.episodes} tập` : ' · 0 tập'}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Thể loại',
      dataIndex: 'genres',
      key: 'genres',
      width: 150,
      render: (genres: string | undefined) => {
        if (!genres) return '-';
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'VIP',
      dataIndex: 'isVipOnly',
      key: 'vip',
      width: 80,
      render: (isVip: boolean) =>
        isVip ? <Tag color="gold">VIP</Tag> : <Tag>Free</Tag>,
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      sorter: true,
      render: (v: number | undefined) => (v !== undefined && v !== null) ? formatNumber(v) : '0',
    },
    {
      title: 'Rating',
      dataIndex: 'ratingAverage',
      key: 'ratingAverage',
      width: 80,
      render: (v: number | undefined) => (v !== undefined && v !== null && v > 0) ? `⭐ ${v.toFixed(1)}` : '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      sorter: true,
      render: (date: string | undefined) => date ? formatDate(date) : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: showPublishActions || showManageEpisodes ? 200 : 120,
      fixed: 'right' as const,
      render: (_: unknown, record: Video) => (
        <Space size="small" wrap>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="text"
              onClick={() => onEdit?.(record.id) || router.push(`/videos/edit/${record.id}`)}
              style={{ color: '#1677ff', border: 'none' }}
              className="action-btn-edit"
            />
          </Tooltip>
          {showManageEpisodes && (
            <Tooltip title="Quản lý tập phim">
              <Button 
                size="small" 
                type="text"
                icon={<VideoCameraOutlined />} 
                onClick={() => router.push(`/videos/${record.id}`)}
                style={{ color: '#52c41a', border: 'none' }}
                className="action-btn-episodes"
              />
            </Tooltip>
          )}
          {showPublishActions && record.status === 'DRAFT' && (
            <Popconfirm title="Xuất bản video này?" onConfirm={() => onPublish?.(record.id)}>
              <Tooltip title="Xuất bản">
                <Button 
                  size="small" 
                  type="text" 
                  style={{ color: '#52c41a', border: 'none' }} 
                  icon={<CheckCircleOutlined />} 
                  className="action-btn-publish"
                />
              </Tooltip>
            </Popconfirm>
          )}
          {showPublishActions && record.status === 'PUBLISHED' && (
            <Popconfirm title="Gỡ xuất bản?" onConfirm={() => onUnpublish?.(record.id)}>
              <Tooltip title="Gỡ xuất bản">
                <Button 
                  size="small" 
                  type="text" 
                  style={{ color: '#faad14', border: 'none' }} 
                  icon={<ClockCircleOutlined />} 
                  className="action-btn-unpublish"
                />
              </Tooltip>
            </Popconfirm>
          )}
          
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa video này?"
            onConfirm={() => handleDelete(record.id)}
            okButtonProps={{ danger: true, loading: deleting === record.id }}
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
                loading={deleting === record.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <style jsx global>{`
        .poster-upload-overlay:hover {
          opacity: 1 !important;
        }
        .action-btn-edit:hover,
        .action-btn-episodes:hover,
        .action-btn-publish:hover,
        .action-btn-unpublish:hover,
        .action-btn-view:hover,
        .action-btn-delete:hover {
          background-color: transparent !important;
          opacity: 0.8;
        }
        .action-btn-edit:focus,
        .action-btn-episodes:focus,
        .action-btn-publish:focus,
        .action-btn-unpublish:focus,
        .action-btn-view:focus,
        .action-btn-delete:focus {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
      <Table
        dataSource={videoList}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onChange={onChange}
        rowKey="id"
        scroll={{ x: 1200 }}
      />
    </>
  );
}
