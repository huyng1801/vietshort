'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Row,
  Col,
  Divider,
  Alert,
  message,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  InfoCircleOutlined,
  AndroidOutlined,
  AppleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { AdConfig } from '@/types';

export default function AdsConfigForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    adminAPI
      .getAdsConfig()
      .then((res) => {
        const config = res.data?.data || res.data || {};
        form.setFieldsValue(config);
      })
      .catch(() => message.error('Không thể tải cấu hình quảng cáo'))
      .finally(() => setFetching(false));
  }, [form]);

  const handleSave = async (values: AdConfig) => {
    setLoading(true);
    try {
      await adminAPI.updateAdsConfig(values as unknown as Record<string, unknown>);
      message.success('Đã lưu cấu hình quảng cáo');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể lưu cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const testMode = Form.useWatch('testMode', form);

  return (
    <Card loading={fetching}>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* ── Global Toggle ────────────────────────── */}
        <Divider titlePlacement="left">🎯 Bật/Tắt quảng cáo</Divider>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="adsEnabled" label="Quảng cáo toàn hệ thống" valuePropName="checked">
              <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="testMode"
              label={
                <Space>
                  <ExperimentOutlined />
                  Chế độ test
                  <Tooltip title="Bật để hiển thị quảng cáo thử nghiệm, không tính doanh thu">
                    <InfoCircleOutlined style={{ color: '#999' }} />
                  </Tooltip>
                </Space>
              }
              valuePropName="checked"
            >
              <Switch checkedChildren="TEST" unCheckedChildren="LIVE" />
            </Form.Item>
          </Col>
        </Row>

        {testMode && (
          <Alert
            message="Chế độ Test đang bật"
            description="Quảng cáo sẽ hiển thị dạng thử nghiệm. Tắt trước khi đưa lên production."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* ── Hiển thị theo loại user ────────────────── */}
        <Divider titlePlacement="left">👥 Hiển thị theo loại người dùng</Divider>

        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="showAdsToGuest" label="Khách (Guest)" valuePropName="checked">
              <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="showAdsToFree" label="Thành viên miễn phí" valuePropName="checked">
              <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="showAdsToVipFreeads" label={<><Tag color="blue">VIP FreeAds</Tag></>} valuePropName="checked">
              <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="showAdsToVipGold" label={<><Tag color="gold">VIP Gold</Tag></>} valuePropName="checked">
              <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
            </Form.Item>
          </Col>
        </Row>

        <Alert
          message="VIP FreeAds và VIP Gold mặc định không hiển thị quảng cáo. Chỉ bật nếu cần thiết."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* ── AdMob App IDs ─────────────────────────── */}
        <Divider titlePlacement="left">📱 AdMob App ID</Divider>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="admobAppIdAndroid"
              label={
                <Space>
                  <AndroidOutlined style={{ color: '#3DDC84' }} />
                  Android App ID
                </Space>
              }
              rules={[{ pattern: /^ca-app-pub-\d+~\d+$/, message: 'Định dạng: ca-app-pub-xxx~yyy' }]}
            >
              <Input placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="admobAppIdIos"
              label={
                <Space>
                  <AppleOutlined />
                  iOS App ID
                </Space>
              }
              rules={[{ pattern: /^ca-app-pub-\d+~\d+$/, message: 'Định dạng: ca-app-pub-xxx~yyy' }]}
            >
              <Input placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy" />
            </Form.Item>
          </Col>
        </Row>

        {/* ── Test Devices ──────────────────────────── */}
        <Form.Item
          name="testDeviceIds"
          label="Thiết bị test (mỗi ID một dòng)"
          tooltip="Thêm device ID để nhận quảng cáo test trên thiết bị thật"
        >
          <Input.TextArea
            rows={3}
            placeholder="ABC123DEF456&#10;789GHI012JKL"
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </Form.Item>

        {/* ── Giới hạn tần suất toàn cục ────────────── */}
        <Divider titlePlacement="left">⏱️ Giới hạn tần suất toàn cục</Divider>

        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="globalMaxAdsPerHour"
              label="Tối đa QC/giờ"
              tooltip="Số lượng quảng cáo tối đa mỗi giờ cho 1 người dùng"
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0 = không giới hạn" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="globalMaxAdsPerDay"
              label="Tối đa QC/ngày"
              tooltip="Số lượng quảng cáo tối đa mỗi ngày cho 1 người dùng"
            >
              <InputNumber min={0} max={1000} style={{ width: '100%' }} placeholder="0 = không giới hạn" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="minIntervalBetweenAds"
              label="Khoảng cách tối thiểu (giây)"
              tooltip="Thời gian tối thiểu giữa 2 lần hiển thị QC"
            >
              <InputNumber min={0} max={3600} style={{ width: '100%' }} addonAfter="giây" />
            </Form.Item>
          </Col>
        </Row>

        {/* ── Cấu hình Banner ──────────────────────── */}
        <Divider titlePlacement="left">🏷️ Quảng cáo Banner</Divider>

        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item name="bannerEnabled" label="Bật quảng cáo Banner" valuePropName="checked">
              <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="bannerRefreshInterval"
              label="Tự động refresh (giây)"
              tooltip="Thời gian tự động refresh banner, 0 = không refresh"
            >
              <InputNumber min={0} max={600} style={{ width: '100%' }} addonAfter="giây" />
            </Form.Item>
          </Col>
        </Row>

        {/* ── Cấu hình Interstitial ─────────────────── */}
        <Divider titlePlacement="left">Quảng cáo Interstitial (toàn màn hình)</Divider>

        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item name="interstitialEnabled" label="Bật quảng cáo Interstitial" valuePropName="checked">
              <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="interstitialAfterEpisodes"
              label="Hiển thị sau mỗi N tập"
              tooltip="Hiển thị interstitial sau khi xem N tập liên tiếp"
            >
              <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="tập" />
            </Form.Item>
          </Col>
        </Row>

        {/* ── Cấu hình Reward Video ─────────────────── */}
        <Divider titlePlacement="left">🎁 Quảng cáo Reward Video</Divider>

        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Form.Item name="rewardVideoEnabled" label="Bật Reward Video" valuePropName="checked">
              <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="defaultRewardGold"
              label="Vàng thưởng mặc định"
              tooltip="Số vàng người dùng nhận khi xem xong reward video"
            >
              <InputNumber min={0} max={10000} style={{ width: '100%' }} addonAfter="🪙" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="maxRewardAdsPerDay"
              label="Tối đa reward/ngày"
              tooltip="Số lần xem reward tối đa/ngày cho 1 user"
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="lần" />
            </Form.Item>
          </Col>
        </Row>

        {/* ── Save Button ───────────────────────────── */}
        <Divider />
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
            Lưu cấu hình quảng cáo
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
