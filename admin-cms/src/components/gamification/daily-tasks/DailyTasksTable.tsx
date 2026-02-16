'use client';

import { Table, Button, Space, Tag, Popconfirm, Tooltip, Switch, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DailyTask, DailyTaskType } from '@/types';
import { DAILY_TASK_TYPE_LABELS } from '@/types';

// Map loại nhiệm vụ với màu sắc
const TASK_TYPE_COLORS: Record<DailyTaskType, string> = {
  WATCH_VIDEO: 'blue',
  LIKE_VIDEO: 'red',
  COMMENT: 'green',
  SHARE: 'purple',
  WATCH_AD: 'orange',
  RATE_VIDEO: 'gold',
};

interface DailyTasksTableProps {
  tasks: DailyTask[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (task: DailyTask) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function DailyTasksTable({
  tasks,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: DailyTasksTableProps) {
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
      title: 'Tên nhiệm vụ',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: DailyTask) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 130,
      render: (type: DailyTaskType) => (
        <Tag color={TASK_TYPE_COLORS[type] || 'blue'}>{DAILY_TASK_TYPE_LABELS[type] || type}</Tag>
      ),
    },
    {
      title: 'Mục tiêu',
      dataIndex: 'targetCount',
      key: 'targetCount',
      width: 90,
      align: 'center' as const,
      render: (v: number) => <span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span>,
    },
    {
      title: 'Thưởng (vàng)',
      dataIndex: 'rewardGold',
      key: 'rewardGold',
      width: 120,
      align: 'center' as const,
      render: (v: number) => (
        <Tag color="gold" style={{ fontWeight: 600 }}>
          {v.toLocaleString('vi-VN')} 🪙
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center' as const,
      render: (isActive: boolean, record: DailyTask) => (
        <Switch checked={isActive} onChange={() => onToggle(record.id)} size="small" />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: DailyTask) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa nhiệm vụ này?"
            description="Dữ liệu tiến độ người dùng liên quan cũng sẽ bị xóa"
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
        <h3 style={{ margin: 0 }}>Danh sách nhiệm vụ ({tasks.length})</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Thêm nhiệm vụ
        </Button>
      </div>

      <Table
        dataSource={tasks}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} nhiệm vụ`,
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}
