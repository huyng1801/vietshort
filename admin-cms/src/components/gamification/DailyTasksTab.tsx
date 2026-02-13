'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select,
  Switch, message, Popconfirm, Tooltip, Row, Col,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { DailyTask, DailyTaskType } from '@/types/admin';
import { DAILY_TASK_TYPE_LABELS } from '@/types/admin';

const TASK_TYPE_OPTIONS = Object.entries(DAILY_TASK_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function DailyTasksTab() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DailyTask | null>(null);
  const [form] = Form.useForm();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDailyTasks({ limit: 50 });
      setTasks(res.data?.data || []);
    } catch {
      message.error('Không thể tải danh sách nhiệm vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ targetCount: 1, rewardGold: 10, isActive: true, sortOrder: tasks.length + 1 });
    setModalOpen(true);
  };

  const handleEdit = (record: DailyTask) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await adminAPI.updateDailyTask(editing.id, values);
        message.success('Đã cập nhật nhiệm vụ');
      } else {
        await adminAPI.createDailyTask(values);
        message.success('Đã tạo nhiệm vụ mới');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteDailyTask(id);
      message.success('Đã xóa nhiệm vụ');
      fetchTasks();
    } catch {
      message.error('Không thể xóa nhiệm vụ');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminAPI.toggleDailyTask(id);
      message.success('Đã thay đổi trạng thái');
      fetchTasks();
    } catch {
      message.error('Không thể thay đổi trạng thái');
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      render: (v: number) => v || '-',
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
        <Tag color="blue">{DAILY_TASK_TYPE_LABELS[type] || type}</Tag>
      ),
    },
    {
      title: 'Mục tiêu',
      dataIndex: 'targetCount',
      key: 'targetCount',
      width: 90,
      align: 'center' as const,
    },
    {
      title: 'Thưởng (vàng)',
      dataIndex: 'rewardGold',
      key: 'rewardGold',
      width: 120,
      align: 'center' as const,
      render: (v: number) => <Tag color="gold">{v} 🪙</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: DailyTask) => (
        <Switch checked={isActive} onChange={() => handleToggle(record.id)} size="small" />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_: any, record: DailyTask) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa nhiệm vụ này?"
            description="Dữ liệu tiến độ người dùng liên quan cũng sẽ bị xóa"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Nhiệm vụ hằng ngày ({tasks.length})</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm nhiệm vụ
        </Button>
      </div>

      <Table
        dataSource={tasks}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={editing ? 'Sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên nhiệm vụ" rules={[{ required: true, message: 'Nhập tên nhiệm vụ' }]}>
            <Input placeholder="VD: Xem 3 tập phim" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="VD: Xem ít nhất 3 tập phim trong ngày" />
          </Form.Item>
          <Form.Item name="taskType" label="Loại nhiệm vụ" rules={[{ required: true, message: 'Chọn loại' }]}>
            <Select options={TASK_TYPE_OPTIONS} placeholder="Chọn loại nhiệm vụ" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="targetCount" label="Mục tiêu" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rewardGold" label="Thưởng vàng" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sortOrder" label="Thứ tự">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
