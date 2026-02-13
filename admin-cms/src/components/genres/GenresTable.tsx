'use client';

import { Table, Tag, Badge, Space, Button, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { Genre } from '@/types/admin';
import DeleteConfirmPopover from './DeleteConfirmPopover';

interface GenresTableProps {
  genres: Genre[];
  loading: boolean;
  pagination: any;
  onTableChange: (pagination: any, filters?: any, sorter?: any) => void;
  onEdit: (genre: Genre) => void;
  onDelete: (genre: Genre) => void;
}

export default function GenresTable({
  genres,
  loading,
  pagination,
  onTableChange,
  onEdit,
  onDelete,
}: GenresTableProps): ReactNode {
  const columns = [
    {
      title: 'Tên thể loại',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 180,
      render: (v: string) => <Tag color="green">{v}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 280,
      render: (v: string) => v || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      align: 'center' as const,
      sorter: (a: Genre, b: Genre) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      align: 'center' as const,
      render: (v: boolean) => (
        <Badge
          status={v ? 'success' : 'default'}
          text={v ? 'Hoạt động' : 'Ẩn'}
        />
      ),
    },
    {
      title: 'Số video',
      dataIndex: 'videoCount',
      key: 'videoCount',
      width: 90,
      align: 'center' as const,
      render: (_: any, record: Genre) => <Tag>{record.videoCount ?? 0}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Genre) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          <DeleteConfirmPopover
            genre={record}
            onConfirm={onDelete}
            loading={loading}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={genres}
      loading={loading}
      rowKey="id"
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `Tổng ${total} thể loại`,
      }}
      onChange={onTableChange}
      scroll={{ x: 1200 }}
    />
  );
}
