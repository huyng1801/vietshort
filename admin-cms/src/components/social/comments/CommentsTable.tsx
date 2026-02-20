'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Table, Tag, Badge, Space, Button, Popconfirm, Avatar, Typography, Tooltip } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import type { Comment } from '@/types';

const { Text, Paragraph } = Typography;

interface CommentsTableProps {
  comments: Comment[];
  loading: boolean;
  pagination: TablePaginationConfig;
  selectedRowKeys: string[];
  onTableChange: (pagination: TablePaginationConfig, filters: unknown, sorter: unknown) => void;
  onSelectionChange: (keys: string[]) => void;
  onModerate: (id: string, isApproved: boolean) => void;
  onDelete: (id: string) => void;
}

export default memo(function CommentsTable({
  comments,
  loading,
  pagination,
  selectedRowKeys,
  onTableChange,
  onSelectionChange,
  onModerate,
  onDelete,
}: CommentsTableProps) {
  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 180,
      render: (_: any, record: Comment) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Avatar src={record.user?.avatar} size="small">{record.user?.nickname?.[0]}</Avatar>
            {record.user?.id ? (
              <Link href={`/users/${record.user.id}`}>
                <Text strong className="hover:text-blue-600 transition-colors cursor-pointer">
                  {record.user?.nickname || '—'}
                </Text>
              </Link>
            ) : (
              <Text strong>{record.user?.nickname || '—'}</Text>
            )}
          </div>
          <Text type="secondary" className="text-xs">{record.user?.email || '—'}</Text>
        </div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 280,
      ellipsis: true,
      render: (content: string, record: Comment) => (
        <Paragraph ellipsis={{ rows: 2 }} className="mb-0">{content}</Paragraph>
      ),
    },
    {
      title: 'Video',
      key: 'video',
      width: 180,
      ellipsis: true,
      render: (_: any, record: Comment) => (
        record.video?.id ? (
          <Link href={`/videos/${record.video.id}`}>
            <Text className="hover:text-blue-600 transition-colors cursor-pointer">
              {record.video?.title || '—'}
            </Text>
          </Link>
        ) : (
          <Text type="secondary">{record.video?.title || '—'}</Text>
        )
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Comment) => (
        <Space orientation="vertical" size={0}>
          <Badge
            status={record.isApproved ? 'success' : 'warning'}
            text={record.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
          />
          {record.isReported && (
            <Tag color="red" icon={<WarningOutlined />}>Báo cáo</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '❤️',
      key: 'likeCount',
      width: 70,
      align: 'center' as const,
      render: (_: any, record: Comment) => (
        <Text>{record.likeCount || 0}</Text>
      ),
    },
    {
      title: 'Phản hồi',
      key: 'replies',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: Comment) => (
        <Text>{record._count?.replies || 0}</Text>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: Comment) => (
        <Space>
          {!record.isApproved ? (
            <Tooltip title="Duyệt">
              <Button 
                type="link" 
                size="small" 
                icon={<CheckOutlined />} 
                style={{ color: '#52c41a' }} 
                onClick={() => onModerate(record.id, true)} 
              />
            </Tooltip>
          ) : (
            <Tooltip title="Ẩn">
              <Button 
                type="link" 
                size="small" 
                icon={<CloseOutlined />} 
                style={{ color: '#faad14' }} 
                onClick={() => onModerate(record.id, false)} 
              />
            </Tooltip>
          )}
          <Popconfirm 
            title="Xác nhận xóa" 
            onConfirm={() => onDelete(record.id)} 
            placement="topRight"
            okText="Xóa" 
            cancelText="Hủy" 
            okButtonProps={{ danger: true }}
            description="Dữ liệu bình luận và phản hồi liên quan cũng sẽ bị xóa"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={comments}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys) => onSelectionChange(keys as string[]),
      }}
      scroll={{ x: 1600 }}
    />
  );
});
