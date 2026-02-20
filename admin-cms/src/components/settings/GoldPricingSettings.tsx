'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  InputNumber,
  Input,
  Switch,
  Modal,
  Form,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GoldOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { GoldPackage } from '@/types';

const { Text } = Typography;

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export default function GoldPricingSettings() {
  const [packages, setPackages] = useState<GoldPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<GoldPackage | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getGoldPackages();
      const data: GoldPackage[] = res.data?.data || res.data || [];
      setPackages(data);
    } catch {
      message.error('Không thể tải danh sách gói Gold');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const openCreateModal = () => {
    setEditingPkg(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      isPopular: false,
      bonusGold: 0,
      sortOrder: packages.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (pkg: GoldPackage) => {
    setEditingPkg(pkg);
    form.setFieldsValue({
      name: pkg.name,
      goldAmount: pkg.goldAmount,
      bonusGold: pkg.bonusGold,
      priceVnd: pkg.priceVnd,
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder,
      description: pkg.description,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editingPkg) {
        await adminAPI.updateGoldPackage(editingPkg.id, values);
        message.success('Đã cập nhật gói Gold');
      } else {
        await adminAPI.createGoldPackage(values);
        message.success('Đã tạo gói Gold mới');
      }

      setModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      message.error(err?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteGoldPackage(id);
      message.success('Đã xóa gói Gold');
      fetchPackages();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleQuickUpdate = async (id: string, field: string, value: any) => {
    try {
      await adminAPI.updateGoldPackage(id, { [field]: value });
      message.success('Đã cập nhật');
      fetchPackages();
    } catch {
      message.error('Cập nhật thất bại');
    }
  };

  const columns = [
    {
      title: 'TT',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      sorter: (a: GoldPackage, b: GoldPackage) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: GoldPackage) => (
        <Space>
          <GoldOutlined style={{ color: '#f59e0b' }} />
          <Text strong>{name}</Text>
          {record.isPopular && <Tag color="gold">Phổ biến</Tag>}
        </Space>
      ),
    },
    {
      title: 'Gold',
      dataIndex: 'goldAmount',
      key: 'goldAmount',
      width: 100,
      render: (gold: number) => <Text strong style={{ color: '#f59e0b' }}>{gold}</Text>,
    },
    {
      title: 'Bonus',
      dataIndex: 'bonusGold',
      key: 'bonusGold',
      width: 100,
      render: (bonus: number) =>
        bonus > 0 ? <Tag color="green">+{bonus}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'priceVnd',
      key: 'priceVnd',
      width: 140,
      render: (price: number) => <Text strong>{formatVND(price)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: GoldPackage) => (
        <Switch
          checked={isActive}
          size="small"
          onChange={(checked) => handleQuickUpdate(record.id, 'isActive', checked)}
        />
      ),
    },
    {
      title: 'Phổ biến',
      dataIndex: 'isPopular',
      key: 'isPopular',
      width: 100,
      render: (isPopular: boolean, record: GoldPackage) => (
        <Switch
          checked={isPopular}
          size="small"
          onChange={(checked) => handleQuickUpdate(record.id, 'isPopular', checked)}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_: any, record: GoldPackage) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa gói Gold này?"
            description="Thao tác này không thể hoàn tác"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <GoldOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
          <span>Bảng giá nạp Gold</span>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchPackages}>
            Tải lại
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Thêm gói
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={packages}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={editingPkg ? 'Sửa gói Gold' : 'Thêm gói Gold mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText={editingPkg ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên gói"
            rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
          >
            <Input placeholder="VD: Gói 300 Gold" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="goldAmount"
              label="Số Gold"
              rules={[{ required: true, message: 'Bắt buộc' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="VD: 300"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>

            <Form.Item
              name="bonusGold"
              label="Bonus Gold"
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="VD: 30"
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="priceVnd"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <InputNumber
              min={1000}
              step={1000}
              style={{ width: '100%' }}
              placeholder="VD: 49000"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="Thứ tự hiển thị"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn cho gói" />
          </Form.Item>

          <Space>
            <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isPopular" label="Đánh dấu phổ biến" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Card>
  );
}
