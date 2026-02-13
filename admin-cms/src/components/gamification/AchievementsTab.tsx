'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select,
  Switch, message, Popconfirm, Tooltip, Row, Col,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { Achievement, AchievementCondition } from '@/types/admin';
import {
  ACHIEVEMENT_CONDITION_LABELS,
  ACHIEVEMENT_CATEGORY_LABELS,
} from '@/types/admin';

const CONDITION_OPTIONS = Object.entries(ACHIEVEMENT_CONDITION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_OPTIONS = Object.entries(ACHIEVEMENT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_COLORS: Record<string, string> = {
  social: 'blue',
  watch: 'green',
  payment: 'gold',
};

export default function AchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAchievements({
        limit: 50,
        category: filterCategory,
      });
      setAchievements(res.data?.data || []);
    } catch {
      message.error('Không thể tải danh sách thành tích');
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      conditionValue: 1,
      rewardGold: 50,
      isActive: true,
      sortOrder: achievements.length + 1,
      category: 'social',
    });
    setModalOpen(true);
  };

  const handleEdit = (record: Achievement) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await adminAPI.updateAchievement(editing.id, values);
        message.success('Đã cập nhật thành tích');
      } else {
        await adminAPI.createAchievement(values);
        message.success('Đã tạo thành tích mới');
      }
      setModalOpen(false);
      fetchAchievements();
    } catch (err: any) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteAchievement(id);
      message.success('Đã xóa thành tích');
      fetchAchievements();
    } catch {
      message.error('Không thể xóa thành tích');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminAPI.toggleAchievement(id);
      message.success('Đã thay đổi trạng thái');
      fetchAchievements();
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
      render: (_: any, record: Achievement) => (
        <span>
          {ACHIEVEMENT_CONDITION_LABELS[record.conditionType] || record.conditionType}
          {' '}
          <Tag color="cyan">×{record.conditionValue}</Tag>
        </span>
      ),
    },
    {
      title: 'Thưởng',
      dataIndex: 'rewardGold',
      key: 'rewardGold',
      width: 100,
      align: 'center' as const,
      render: (v: number) => <Tag color="gold">{v} 🪙</Tag>,
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
      width: 90,
      render: (isActive: boolean, record: Achievement) => (
        <Switch checked={isActive} onChange={() => handleToggle(record.id)} size="small" />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_: any, record: Achievement) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa thành tích này?"
            description="Dữ liệu người dùng đã mở thành tích này cũng sẽ bị xóa"
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
        <Space>
          <h3 style={{ margin: 0 }}>Thành tích ({achievements.length})</h3>
          <Select
            allowClear
            placeholder="Lọc danh mục"
            style={{ width: 140 }}
            options={CATEGORY_OPTIONS}
            value={filterCategory}
            onChange={setFilterCategory}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm thành tích
        </Button>
      </div>

      <Table
        dataSource={achievements}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={editing ? 'Sửa thành tích' : 'Tạo thành tích mới'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên thành tích" rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input placeholder="VD: Người xem tích cực" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="VD: Xem 10 tập phim" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                <Select options={CATEGORY_OPTIONS} placeholder="Chọn danh mục" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="conditionType" label="Loại điều kiện" rules={[{ required: true, message: 'Chọn điều kiện' }]}>
                <Select options={CONDITION_OPTIONS} placeholder="Chọn điều kiện" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="conditionValue" label="Giá trị điều kiện" rules={[{ required: true }]}>
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
