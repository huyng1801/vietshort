'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Select,
  Row,
  Col,
  Alert,
  message,
} from 'antd';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';

export default function GeneralSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    adminAPI
      .getSettings()
      .then((res) => form.setFieldsValue(res.data?.data || res.data))
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
        <Form.Item
          name="siteName"
          label="Tên trang"
          rules={[{ required: true, message: 'Vui lòng nhập tên trang' }]}
        >
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
