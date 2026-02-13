'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Space, Image, message, Switch, Empty, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Banner } from '@/types/admin';
import { formatDate } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

interface BannerTableProps {
  banners: Banner[];
  loading?: boolean;
  pagination?: any;
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  onRefresh?: () => void;
  onEdit?: (banner: Banner) => void;
}

export default function BannerTable({
  banners,
  loading,
  pagination,
  onChange,
  onRefresh,
  onEdit,
}: BannerTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!id) {
      message.error('ID banner không hợp lệ');
      return;
    }

    try {
      setDeleting(id);
      await adminAPI.deleteBanner(id);
      message.success('✓ Đã xóa banner thành công!');
      onRefresh?.();
    } catch (err: any) {
      console.error('Delete banner error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Xóa banner thất bại';
      message.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await adminAPI.updateBanner(id, { isActive });
      message.success(isActive ? 'Đã kích hoạt banner' : 'Đã ẩn banner');
      onRefresh?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 180,
      render: (url: string) =>
        url ? (
          <Image src={url} alt="banner" width={160} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />
        ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Đối tượng',
      dataIndex: 'targetVipType',
      key: 'target',
      width: 120,
      render: (v: string | null) => {
        if (!v) return <Tag>Tất cả</Tag>;
        if (v === 'VIP_FREEADS') return <Tag color="blue">VIP FreeAds</Tag>;
        if (v === 'VIP_GOLD') return <Tag color="gold">VIP Gold</Tag>;
        return v;
      },
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a: Banner, b: Banner) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean, record: Banner) => (
        <Switch checked={active} onChange={(v) => handleToggleActive(record.id, v)} size="small" />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: Banner) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit?.(record)} />
          </Tooltip>
          <Popconfirm
            title={<strong style={{ fontWeight: 600 }}>Xác nhận xóa</strong>}
            description="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => handleDelete(record.id)}
            okButtonProps={{ danger: true, loading: deleting === record.id }}
          >
            <Tooltip title="Xóa">
              <Button 
                type="link" 
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
    <Table
      columns={columns as any}
      dataSource={banners}
      loading={loading}
      rowKey="id"
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 1200 }}
    />
  );
}
