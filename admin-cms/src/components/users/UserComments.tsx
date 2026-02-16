'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Tooltip, message, Popconfirm, Empty } from 'antd';
import { CommentOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { formatDate } from '@/lib/admin-utils';
import type { ColumnsType } from 'antd/es/table';

interface UserComment {
  id: string;
  content: string;
  videoId: string;
  parentId?: string;
  isHidden: boolean;
  isApproved?: boolean;
  isReported?: boolean;
  reportCount?: number;
  likeCount: number;
  video: { id: string; title: string; slug: string };
  parent?: { id: string; content: string; user: { nickname?: string } };
  _count?: { replies: number };
  createdAt: string;
}

interface UserCommentsProps {
  userId: string;
}

export default function UserComments({ userId }: UserCommentsProps) {
  const [data, setData] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchData = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await adminAPI.getComments({ userId, page, limit, sortBy: 'createdAt', sortOrder: 'desc' });
      const result = res.data?.data || res.data;
      setData(result?.items || result?.data || []);
      const p = result?.pagination;
      if (p) setPagination({ current: p.page, pageSize: p.limit, total: p.total });
      else setPagination((prev) => ({ ...prev, total: result?.total || 0 }));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleHide = async (id: string, hidden: boolean) => {
    try {
      await adminAPI.moderateComment(id, hidden); // hidden=true -> approve (show), hidden=false -> hide
      message.success(hidden ? 'Đã hiển thị bình luận' : 'Đã ẩn bình luận');
      fetchData(pagination.current, pagination.pageSize);
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteComment(id);
      message.success('Đã xóa bình luận');
      fetchData(pagination.current, pagination.pageSize);
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const columns: ColumnsType<UserComment> = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 350,
      render: (content: string, record) => (
        <div>
          <Typography.Paragraph
            ellipsis={{ rows: 2 }}
            style={{ margin: 0, opacity: record.isHidden ? 0.5 : 1 }}
          >
            {content}
          </Typography.Paragraph>
          {record.parentId && record.parent && (
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              ↳ Trả lời: {record.parent.user?.nickname || 'Ẩn danh'}
            </Typography.Text>
          )}
        </div>
      ),
    },
    {
      title: 'Video',
      key: 'video',
      width: 200,
      render: (_, record) => (
        <Typography.Text ellipsis style={{ maxWidth: 180 }}>
          <LinkOutlined /> {record.video?.title || '-'}
        </Typography.Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          {record.isHidden ? (
            <Tag color="orange">Đã ẩn</Tag>
          ) : (
            <Tag color="green">Hiển thị</Tag>
          )}
          {record.isReported && (
            <Tag color="red">Bị báo cáo ({record.reportCount})</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Thích',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 80,
      align: 'center',
      render: (v: number) => v || 0,
    },
    {
      title: 'Trả lời',
      key: 'replies',
      width: 80,
      align: 'center',
      render: (_, record) => record._count?.replies || 0,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={record.isHidden ? 'Hiện' : 'Ẩn'}>
            <Button
              size="small"
              type="text"
              icon={record.isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => handleToggleHide(record.id, record.isHidden)}
            />
          </Tooltip>
          <Popconfirm title="Xóa bình luận này?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<><CommentOutlined /> Bình luận của người dùng</>}
      size="small"
      extra={<Button icon={<ReloadOutlined />} size="small" onClick={() => fetchData()} />}
    >
      {data.length === 0 && !loading ? (
        <Empty description="Chưa có bình luận nào" />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} bình luận`,
          }}
          onChange={(p) => fetchData(p.current, p.pageSize)}
        />
      )}
    </Card>
  );
}
