'use client';

import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Progress, Space, Card, message } from 'antd';
import { ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import { EncodingJob } from '@/types/admin';
import { formatDate, getStatusColor, getStatusText } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

export default function EncodingQueueTable() {
  const [jobs, setJobs] = useState<EncodingJob[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobs();

    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    });

    socket.on('encoding:progress', (data: { id: string; progress: number; status: string }) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === data.id
            ? { ...j, encodingProgress: data.progress, encodingStatus: data.status as EncodingJob['encodingStatus'] }
            : j,
        ),
      );
    });

    socket.on('encoding:completed', (data: { id: string }) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === data.id ? { ...j, encodingStatus: 'COMPLETED' as const, encodingProgress: 100 } : j,
        ),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getEncodingQueue();
      setJobs(res.data.data || []);
    } catch {
      message.error('Không thể tải hàng đợi mã hóa');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    try {
      await adminAPI.reprocessEpisode(jobId);
      message.success('Đã thử lại mã hóa');
      loadJobs();
    } catch {
      message.error('Thử lại thất bại');
    }
  };

  const columns = [
    {
      title: 'Video',
      dataIndex: 'videoTitle',
      key: 'videoTitle',
      width: 250,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'encodingStatus',
      key: 'encodingStatus',
      width: 120,
      render: (status: string) => {
        const icon = status === 'processing' ? <SyncOutlined spin /> : null;
        return (
          <Tag color={getStatusColor(status)} icon={icon}>
            {getStatusText(status)}
          </Tag>
        );
      },
    },
    {
      title: 'Tiến độ',
      dataIndex: 'encodingProgress',
      key: 'encodingProgress',
      width: 200,
      render: (progress: number, record: EncodingJob) => (
        <Progress
          percent={progress}
          size="small"
          status={
            record.encodingStatus === 'FAILED'
              ? 'exception'
              : record.encodingStatus === 'COMPLETED'
                ? 'success'
                : 'active'
          }
        />
      ),
    },
    {
      title: 'Lỗi',
      dataIndex: 'encodingError',
      key: 'encodingError',
      width: 200,
      render: (error: string) => error ? <Tag color="red">{error}</Tag> : '-',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: EncodingJob) =>
        record.encodingStatus === 'FAILED' ? (
          <Button size="small" onClick={() => handleRetry(record.id)}>
            Thử lại
          </Button>
        ) : null,
    },
  ];

  return (
    <Card
      title="Hàng đợi mã hóa"
      extra={
        <Button icon={<ReloadOutlined />} onClick={loadJobs}>
          Làm mới
        </Button>
      }
    >
      <Table
        dataSource={jobs}
        columns={columns}
        loading={loading}
        rowKey="id"
        size="middle"
        pagination={{ pageSize: 20 }}
      />
    </Card>
  );
}
