'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Space, Switch, Tooltip, Popconfirm, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import type { AdPlacement, AdPlacementType } from '@/types';
import { formatDate, formatNumber } from '@/lib/admin-utils';
import adminAPI from '@/lib/admin-api';

const { Text } = Typography;

interface AdPlacementsTableProps {
  placements: AdPlacement[];
  loading?: boolean;
  pagination?: any;
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  onRefresh?: () => void;
  onEdit?: (placement: AdPlacement) => void;
}

const typeConfig: Record<AdPlacementType, { color: string; label: string }> = {
  BANNER: { color: 'blue', label: 'Banner' },
  INTERSTITIAL: { color: 'orange', label: 'Interstitial' },
  REWARD_VIDEO: { color: 'green', label: 'Reward Video' },
  NATIVE: { color: 'purple', label: 'Native' },
};

const platformColors: Record<string, string> = {
  ADMOB: 'volcano',
  FACEBOOK: 'blue',
  UNITY: 'cyan',
  CUSTOM: 'default',
};

export default function AdPlacementsTable({
  placements,
  loading,
  pagination,
  onChange,
  onRefresh,
  onEdit,
}: AdPlacementsTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await adminAPI.deleteAdPlacement(id);
      message.success('Đã xóa vị trí quảng cáo');
      onRefresh?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      setToggling(id);
      await adminAPI.toggleAdPlacement(id, isActive);
      message.success(isActive ? 'Đã bật quảng cáo' : 'Đã tắt quảng cáo');
      onRefresh?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setToggling(null);
    }
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string, record: AdPlacement) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.position}</Text>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: AdPlacementType) => (
        <Tag color={typeConfig[type]?.color || 'default'}>
          {typeConfig[type]?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Nền tảng',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (p: string) => (
        <Tag color={platformColors[p] || 'default'}>{p}</Tag>
      ),
    },
    {
      title: 'Ad Unit ID',
      dataIndex: 'adUnitId',
      key: 'adUnitId',
      width: 200,
      render: (id: string) => (
        <Space size={4}>
          <Text code style={{ fontSize: 11 }}>{id ? `${id.slice(0, 20)}...` : '—'}</Text>
          {id && (
            <Tooltip title="Sao chép">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => { navigator.clipboard.writeText(id); message.success('Đã sao chép'); }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Thiết bị',
      dataIndex: 'targetPlatforms',
      key: 'targetPlatforms',
      width: 130,
      render: (platforms: string[]) => (
        <Space size={2}>
          {(platforms || []).map((p) => (
            <Tag key={p} color={p === 'android' ? 'green' : p === 'ios' ? 'geekblue' : 'default'}>
              {p === 'android' ? '🤖' : p === 'ios' ? '🍎' : '🌐'} {p}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Tần suất',
      key: 'frequency',
      width: 120,
      render: (_: unknown, record: AdPlacement) => (
        <div style={{ fontSize: 12 }}>
          <div>Mỗi {record.frequency || 0}p</div>
          <Text type="secondary">Max: {record.maxPerDay || '∞'}/ngày</Text>
        </div>
      ),
    },
    {
      title: 'Reward',
      key: 'reward',
      width: 90,
      render: (_: unknown, record: AdPlacement) =>
        record.type === 'REWARD_VIDEO' ? (
          <Tag color="gold">🪙 {record.rewardGold || 0} ({record.rewardMultiplier || 1}x)</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      key: 'impressions',
      width: 100,
      sorter: (a: AdPlacement, b: AdPlacement) => (a.impressions || 0) - (b.impressions || 0),
      render: (v: number) => formatNumber(v || 0),
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      width: 70,
      render: (v: number) => (
        <Tag color={(v || 0) > 2 ? 'green' : (v || 0) > 0.5 ? 'orange' : 'default'}>
          {(v || 0).toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 100,
      sorter: (a: AdPlacement, b: AdPlacement) => (a.revenue || 0) - (b.revenue || 0),
      render: (v: number) => (
        <Text strong style={{ color: '#52c41a' }}>${(v || 0).toFixed(2)}</Text>
      ),
    },
    {
      title: 'Bật/Tắt',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (active: boolean, record: AdPlacement) => (
        <Switch
          checked={active}
          onChange={(v) => handleToggle(record.id, v)}
          size="small"
          loading={toggling === record.id}
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => d ? formatDate(d) : '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: AdPlacement) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit?.(record)} />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa vị trí QC này?"
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
    <Table
      columns={columns as any}
      dataSource={placements}
      loading={loading}
      rowKey="id"
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 1600 }}
      size="small"
    />
  );
}
