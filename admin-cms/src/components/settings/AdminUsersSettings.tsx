'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  TeamOutlined,
  SafetyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { formatDate } from '@/lib/admin-utils';

const { Text } = Typography;

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'red',
  ADMIN: 'blue',
  MODERATOR: 'green',
  CONTENT_MANAGER: 'orange',
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  CONTENT_MANAGER: 'Biên tập viên',
};

export default function AdminUsersSettings() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAdminUsers();
      const data = res.data?.data || res.data || [];
      setAdmins(Array.isArray(data) ? data : []);
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
    setSubmitting(true);
    try {
      await adminAPI.createAdmin({
        email: values.email.trim(),
        nickname: values.nickname.trim(),
        password: values.password,
        role: values.role,
      });
      message.success('Đã thêm admin mới');
      setModalOpen(false);
      form.resetFields();
      fetchAdmins();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể thêm admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteAdmin(id);
      message.success('Đã xóa admin');
      fetchAdmins();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể xóa admin');
    }
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
      dataIndex: 'nickname',
      key: 'nickname',
      render: (nickname: string, record: any) => {
        const name = [record.firstName, record.lastName].filter(Boolean).join(' ');
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{nickname}</div>
            {name && <Text type="secondary" style={{ fontSize: 12 }}>{name}</Text>}
          </div>
        );
      },
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>{roleLabels[role] || role}</Tag>
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
      render: (date: string) => (date ? formatDate(date) : 'Chưa từng'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa admin này?"
          description="Hành động này không thể hoàn tác"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
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
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Thêm"
        cancelText="Hủy"
        destroyOnHidden
        maskClosable
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<SafetyOutlined />} placeholder="admin@vietshort.vn" />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="Tên hiển thị"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Tên hiển thị" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              placeholder="Chọn vai trò"
              options={[
                { label: 'Super Admin', value: 'SUPER_ADMIN' },
                { label: 'Admin', value: 'ADMIN' },
                { label: 'Moderator', value: 'MODERATOR' },
                { label: 'Biên tập viên', value: 'CONTENT_MANAGER' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
