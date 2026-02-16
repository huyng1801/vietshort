'use client';

import { Table, Tag, Badge, Space, Button, Tooltip, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { Genre } from '@/types';


interface GenresTableProps {
  genres: Genre[];
  loading: boolean;
  pagination: any;
  onTableChange: (pagination: any, filters?: any, sorter?: any) => void;
  onEdit: (genre: Genre) => void;
  onDelete: (genre: Genre) => void | Promise<void>;
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
      render: (_: any, record: Genre) => {
        const count = record.videoCount ?? 0;
        let color = 'default';
        if (count === 0) color = 'default';
        else if (count < 5) color = 'green';
        else if (count < 20) color = 'blue';
        else color = 'red';
        return <Tag color={color}>{count}</Tag>;
      },
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
          {/* Inline Delete Confirm Popover */}
            {(record.videoCount ?? 0) > 0 ? (
              <Tooltip title="Không thể xóa khi có video">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                  disabled
                  style={{ padding: '4px 8px', height: 'auto' }}
                />
              </Tooltip>
            ) : (
              <Popconfirm
                title={<span style={{ fontWeight: 600 }}>Xác nhận xóa</span>}
                description={
                  <div style={{ marginTop: 8 }}>
                    Bạn có chắc chắn muốn xóa thể loại <strong>"{record.name}"</strong>?
                  </div>
                }
                onConfirm={() => onDelete(record)}
                okButtonProps={{ danger: true, loading: loading }}
                okText="Đồng ý"
                cancelText="Hủy"
                placement="topRight"
                overlayStyle={{ width: 280 }}
              >
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                    disabled={loading}
                    style={{ padding: '4px 8px', height: 'auto' }}
                  />
                </Tooltip>
              </Popconfirm>
            )}
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
      pagination={pagination}
      onChange={onTableChange}
      scroll={{ x: 1200 }}
    />
  );
}
