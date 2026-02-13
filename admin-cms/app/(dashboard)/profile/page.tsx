'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  Spin,
  message,
  Descriptions,
  Tag,
  Divider,
  Row,
  Col,
  Avatar,
  Space,
} from 'antd';
import {
  UserOutlined,
  SaveOutlined,
  LockOutlined,
  MailOutlined,
  CalendarOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { formatDate } from '@/lib/admin-utils';

const { Title, Text } = Typography;

interface AdminProfile {
  id: string;
  email: string;
  nickname: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

function ProfileInfo({ profile, onRefresh }: { profile: AdminProfile; onRefresh: () => void }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      nickname: profile.nickname,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
    });
  }, [form, profile]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      await adminAPI.updateProfile(values);
      message.success('Cập nhật thông tin thành công');
      onRefresh();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'red',
    ADMIN: 'blue',
    MODERATOR: 'green',
    EDITOR: 'orange',
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MODERATOR: 'Moderator',
    EDITOR: 'Biên tập viên',
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={8}>
        <Card>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0 }}>{profile.nickname}</Title>
            <Text type="secondary">{profile.email}</Text>
            <div style={{ marginTop: 12 }}>
              <Tag color={roleColors[profile.role] || 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                {roleLabels[profile.role] || profile.role}
              </Tag>
            </div>
          </div>

          <Divider />

          <Descriptions column={1} size="small">
            <Descriptions.Item label={<><MailOutlined /> Email</>}>{profile.email}</Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> Tạo lúc</>}>{formatDate(profile.createdAt)}</Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> Đăng nhập cuối</>}>
              {profile.lastLoginAt ? formatDate(profile.lastLoginAt) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<><SafetyOutlined /> Trạng thái</>}>
              <Tag color={profile.isActive ? 'green' : 'red'}>
                {profile.isActive ? 'Hoạt động' : 'Vô hiệu'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {profile.permissions.length > 0 && (
            <>
              <Divider />
              <Text strong>Quyền hạn:</Text>
              <div style={{ marginTop: 8 }}>
                {profile.permissions.map((p) => (
                  <Tag key={p} style={{ marginBottom: 4 }}>{p}</Tag>
                ))}
              </div>
            </>
          )}
        </Card>
      </Col>

      <Col xs={24} lg={16}>
        <Card title="Cập nhật thông tin">
          <Form form={form} layout="vertical" onFinish={handleSave} style={{ maxWidth: 500 }}>
            <Form.Item
              name="nickname"
              label="Tên hiển thị"
              rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên hiển thị" />
            </Form.Item>
            <Form.Item name="firstName" label="Họ">
              <Input placeholder="Họ" />
            </Form.Item>
            <Form.Item name="lastName" label="Tên">
              <Input placeholder="Tên" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

function ChangePassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      await adminAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<><LockOutlined /> Đổi mật khẩu</>}>
      <Form form={form} layout="vertical" onFinish={handleChangePassword} style={{ maxWidth: 500 }}>
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} danger>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await adminAPI.getProfile();
      setProfile(res.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      message.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return <div style={{ textAlign: 'center', padding: 100 }}>Không thể tải thông tin</div>;
  }

  return (
    <div>
      <div className="page-header">
        <Title level={3}>Thông tin cá nhân</Title>
      </div>

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <ProfileInfo profile={profile} onRefresh={fetchProfile} />
        <ChangePassword />
      </Space>
    </div>
  );
}
