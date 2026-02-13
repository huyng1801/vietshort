'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Tabs,
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  message,
  Select,
  Table,
  Modal,
  Tag,
  Popconfirm,
  Divider,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  CrownOutlined,
  TeamOutlined,
  SafetyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { formatDate } from '@/lib/admin-utils';

const { Title, Text } = Typography;

// ─── General Settings ────────────────────────────────
function GeneralSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    adminAPI.getSettings()
      .then((res) => form.setFieldsValue(res.data))
      .catch(() => message.error('Không thể tải cài đặt'))
      .finally(() => setFetching(false));
  }, [form]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      await adminAPI.updateSettings(values);
      message.success('Đã lưu cài đặt chung');
    } catch {
      message.error('Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<><SettingOutlined /> Cài đặt chung</>} loading={fetching}>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ maxWidth: 600 }}>
        <Form.Item name="siteName" label="Tên trang" rules={[{ required: true, message: 'Vui lòng nhập tên trang' }]}>
          <Input placeholder="VietShort" />
        </Form.Item>
        <Form.Item name="siteDescription" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Nền tảng video ngắn..." />
        </Form.Item>
        <Form.Item name="maintenanceMode" label="Chế độ bảo trì" valuePropName="checked">
          <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
        </Form.Item>
        <Alert
          message="Khi bật chế độ bảo trì, người dùng sẽ không thể truy cập ứng dụng."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="maxUploadSize" label="Dung lượng upload tối đa (MB)">
              <InputNumber min={1} max={10000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="defaultLanguage" label="Ngôn ngữ mặc định">
              <Select
                options={[
                  { label: '🇻🇳 Tiếng Việt', value: 'vi' },
                  { label: '🇺🇸 English', value: 'en' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="allowRegistration" label="Cho phép đăng ký mới" valuePropName="checked">
          <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
        </Form.Item>
        <Form.Item name="autoApproveVideos" label="Tự động duyệt video" valuePropName="checked">
          <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            Lưu cài đặt
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

// ─── VIP Pricing Settings ────────────────────────────
function VIPPricingSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    adminAPI.getSettings()
      .then((res) => form.setFieldsValue(res.data?.vipPricing || {}))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [form]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      await adminAPI.updateSettings({ vipPricing: values });
      message.success('Đã lưu bảng giá VIP');
    } catch {
      message.error('Không thể lưu');
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (v: number | undefined) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <Card title={<><CrownOutlined /> Bảng giá VIP</>} loading={fetching}>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ maxWidth: 600 }}>
        <Card type="inner" title={<Tag color="blue">VIP Silver</Tag>} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['silver', 'monthly']} label="Gói tháng (VNĐ)">
                <InputNumber min={0} style={{ width: '100%' }} formatter={formatVND} addonAfter="₫" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['silver', 'yearly']} label="Gói năm (VNĐ)">
                <InputNumber min={0} style={{ width: '100%' }} formatter={formatVND} addonAfter="₫" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card type="inner" title={<Tag color="gold">VIP Gold</Tag>} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['gold', 'monthly']} label="Gói tháng (VNĐ)">
                <InputNumber min={0} style={{ width: '100%' }} formatter={formatVND} addonAfter="₫" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['gold', 'yearly']} label="Gói năm (VNĐ)">
                <InputNumber min={0} style={{ width: '100%' }} formatter={formatVND} addonAfter="₫" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            Lưu bảng giá
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

// ─── Admin Users Settings ────────────────────────────
function AdminUsersSettings() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSettings();
      setAdmins(res.data?.adminUsers || []);
    } catch {
      message.error('Không thể tải danh sách admin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAdd = async (values: any) => {
    try {
      await adminAPI.updateSettings({ addAdmin: values });
      message.success('Đã thêm admin mới');
      setModalOpen(false);
      form.resetFields();
      fetchAdmins();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể thêm admin');
    }
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'red',
    ADMIN: 'blue',
    MODERATOR: 'green',
    EDITOR: 'orange',
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <Text copyable>{email}</Text>,
    },
    {
      title: 'Tên',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (name: string, record: any) => name || record.nickname || '—',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>{role}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active !== false ? 'green' : 'red'}>
          {active !== false ? 'Hoạt động' : 'Vô hiệu'}
        </Tag>
      ),
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? formatDate(date) : 'Chưa từng',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa admin này?"
          onConfirm={() => message.info('Chức năng đang phát triển')}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      title={<><TeamOutlined /> Quản lý Admin</>}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAdmins} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Thêm admin
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={admins}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: 800 }}
      />

      <Modal
        title="Thêm admin mới"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Thêm"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<SafetyOutlined />} placeholder="admin@vietshort.vn" />
          </Form.Item>
          <Form.Item name="nickname" label="Tên hiển thị" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Tên hiển thị" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select
              placeholder="Chọn vai trò"
              options={[
                { label: 'Super Admin', value: 'SUPER_ADMIN' },
                { label: 'Admin', value: 'ADMIN' },
                { label: 'Moderator', value: 'MODERATOR' },
                { label: 'Biên tập viên', value: 'EDITOR' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

// ─── Main Settings Page ──────────────────────────────
export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <Title level={3}>Cài đặt hệ thống</Title>
      </div>

      <Tabs
        defaultActiveKey="general"
        tabPosition="left"
        style={{ minHeight: 400 }}
        items={[
          {
            key: 'general',
            label: <><SettingOutlined /> Cài đặt chung</>,
            children: <GeneralSettings />,
          },
          {
            key: 'vip',
            label: <><CrownOutlined /> Bảng giá VIP</>,
            children: <VIPPricingSettings />,
          },
          {
            key: 'admins',
            label: <><TeamOutlined /> Quản lý Admin</>,
            children: <AdminUsersSettings />,
          },
        ]}
      />
    </div>
  );
}
