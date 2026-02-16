'use client';

import { Table, Button, Space, Tag, Popconfirm, Tooltip, Switch, Select, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import type { Achievement } from '@/types';
import {
  ACHIEVEMENT_CONDITION_LABELS,
  ACHIEVEMENT_CATEGORY_LABELS,
} from '@/types';

const CATEGORY_OPTIONS = Object.entries(ACHIEVEMENT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_COLORS: Record<string, string> = {
  social: 'blue',      // Tương tác xã hội
  watch: 'green',      // Xem phim
  payment: 'orange',   // Thanh toán & VIP
};

interface AchievementsTableProps {
  achievements: Achievement[];
  loading: boolean;
  filterCategory: string | undefined;
  onFilterChange: (category: string | undefined) => void;
  onAdd: () => void;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function AchievementsTable({
  achievements,
  loading,
  filterCategory,
  onFilterChange,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: AchievementsTableProps) {
  const columns = [
    {
      title: 'STT',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      align: 'center' as const,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v || '-'}</span>,
    },
    {
      title: 'Tên thành tích',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Achievement) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            <TrophyOutlined style={{ color: '#faad14', marginRight: 6 }} />
            {name}
          </div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      render: (cat: string) => (
        <Tag color={CATEGORY_COLORS[cat] || 'default'}>
          {ACHIEVEMENT_CATEGORY_LABELS[cat] || cat}
        </Tag>
      ),
    },
    {
      title: 'Điều kiện',
      key: 'condition',
      width: 200,
      render: (_: any, record: Achievement) => {
        const conditionType = (record.conditionType ?? record.condition?.type ?? '') as keyof typeof ACHIEVEMENT_CONDITION_LABELS;
        const conditionLabel = ACHIEVEMENT_CONDITION_LABELS[conditionType] || conditionType || '';
        const value = record.conditionValue ?? record.condition?.value ?? 0;
        return (
          <span>
            {conditionLabel}
            {' '}
            <Tag color="cyan">×{value}</Tag>
          </span>
        );
      },
    },
    {
      title: 'Thưởng',
      dataIndex: 'rewardGold',
      key: 'rewardGold',
      width: 100,
      align: 'center' as const,
      render: (v: number) => (
        <Tag color="gold" style={{ fontWeight: 600 }}>
          {v.toLocaleString('vi-VN')} 🪙
        </Tag>
      ),
    },
    {
      title: 'Đã mở',
      key: 'unlocked',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: Achievement) => record._count?.userAchievements || 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center' as const,
      render: (isActive: boolean, record: Achievement) => (
        <Switch checked={isActive} onChange={() => onToggle(record.id)} size="small" />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Achievement) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa thành tích này?"
            description="Dữ liệu người dùng đã mở thành tích này cũng sẽ bị xóa"
            onConfirm={() => onDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <h3 style={{ margin: 0 }}>Danh sách thành tích ({achievements.length})</h3>
          <Select
            allowClear
            placeholder="Lọc danh mục"
            style={{ width: 140 }}
            options={CATEGORY_OPTIONS}
            value={filterCategory}
            onChange={onFilterChange}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Thêm thành tích
        </Button>
      </div>

      <Table
        dataSource={achievements}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} thành tích`,
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}
