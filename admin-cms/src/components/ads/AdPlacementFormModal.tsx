'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Divider,
  message,
  Space,
  Alert,
} from 'antd';
import {
  AndroidOutlined,
  AppleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { AdPlacement, AdPlacementType } from '@/types';

interface AdPlacementFormModalProps {
  open: boolean;
  placement: AdPlacement | null; // null = create mode
  onClose: () => void;
  onSuccess: () => void;
}

const AD_TYPES = [
  { label: '🏷️ Banner', value: 'BANNER' },
  { label: '📺 Interstitial (toàn màn hình)', value: 'INTERSTITIAL' },
  { label: '🎁 Reward Video (xem nhận thưởng)', value: 'REWARD_VIDEO' },
  { label: '📰 Native (tùy chỉnh)', value: 'NATIVE' },
];

const PLATFORMS = [
  { label: 'Google AdMob', value: 'ADMOB' },
  { label: 'Facebook Audience Network', value: 'FACEBOOK' },
  { label: 'Unity Ads', value: 'UNITY' },
  { label: 'Tùy chỉnh', value: 'CUSTOM' },
];

const POSITION_PRESETS = [
  { label: '🏠 Trang chủ - Trên cùng', value: 'home_top' },
  { label: '🏠 Trang chủ - Giữa danh sách', value: 'home_feed' },
  { label: '🏠 Trang chủ - Dưới cùng', value: 'home_bottom' },
  { label: '🎬 Trình phát - Trước video', value: 'player_pre' },
  { label: '🎬 Trình phát - Sau video', value: 'player_post' },
  { label: '🎬 Trình phát - Giữa tập', value: 'player_mid' },
  { label: '🔓 Mở khóa tập - Thay vì trả vàng', value: 'episode_unlock' },
  { label: '🔍 Trang tìm kiếm', value: 'search' },
  { label: '📚 Trang chi tiết phim', value: 'video_detail' },
  { label: '👤 Trang cá nhân', value: 'profile' },
  { label: '📋 Danh sách tập', value: 'episode_list' },
  { label: '🎮 Nhiệm vụ hàng ngày', value: 'daily_task_reward' },
  { label: '📰 Trong feed nội dung', value: 'content_feed' },
];

const TARGET_PLATFORMS = [
  { label: <><AndroidOutlined style={{ color: '#3DDC84' }} /> Android</>, value: 'android' },
  { label: <><AppleOutlined /> iOS</>, value: 'ios' },
  { label: <><GlobalOutlined /> Web</>, value: 'web' },
];

export default function AdPlacementFormModal({ open, placement, onClose, onSuccess }: AdPlacementFormModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!placement;
  const adType = Form.useWatch('type', form) as AdPlacementType | undefined;

  useEffect(() => {
    if (!open) return;

    if (placement) {
      form.setFieldsValue({
        name: placement.name,
        type: placement.type,
        platform: placement.platform,
        adUnitId: placement.adUnitId,
        position: placement.position,
        description: placement.description,
        frequency: placement.frequency,
        maxPerSession: placement.maxPerSession,
        maxPerDay: placement.maxPerDay,
        cooldownSeconds: placement.cooldownSeconds,
        targetPlatforms: placement.targetPlatforms || ['android', 'ios'],
        excludeVip: placement.excludeVip,
        rewardGold: placement.rewardGold,
        rewardMultiplier: placement.rewardMultiplier,
        isActive: placement.isActive,
        priority: placement.priority,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: 'BANNER',
        platform: 'ADMOB',
        frequency: 0,
        maxPerSession: 0,
        maxPerDay: 0,
        cooldownSeconds: 30,
        targetPlatforms: ['android', 'ios'],
        excludeVip: true,
        isActive: true,
        priority: 0,
        rewardGold: 2,
        rewardMultiplier: 1,
      });
    }
  }, [open, placement, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const submitData: Record<string, unknown> = {
        name: values.name?.trim(),
        type: values.type,
        platform: values.platform,
        adUnitId: values.adUnitId?.trim(),
        position: values.position,
        description: values.description?.trim() || undefined,
        frequency: values.frequency || 0,
        maxPerSession: values.maxPerSession || 0,
        maxPerDay: values.maxPerDay || 0,
        cooldownSeconds: values.cooldownSeconds || 0,
        targetPlatforms: values.targetPlatforms,
        excludeVip: values.excludeVip !== false,
        isActive: values.isActive !== false,
        priority: values.priority || 0,
      };

      // Reward fields only for REWARD_VIDEO
      if (values.type === 'REWARD_VIDEO') {
        submitData.rewardGold = values.rewardGold || 0;
        submitData.rewardMultiplier = values.rewardMultiplier || 1;
      }

      if (isEdit) {
        await adminAPI.updateAdPlacement(placement.id, submitData);
        message.success('Đã cập nhật vị trí quảng cáo');
      } else {
        await adminAPI.createAdPlacement(submitData);
        message.success('Đã tạo vị trí quảng cáo mới');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Không thể lưu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa vị trí quảng cáo' : 'Thêm vị trí quảng cáo mới'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={isEdit ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      width={720}
      destroyOnHidden
      maskClosable={!submitting}
      centered
    >
      <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
        {/* ── Thông tin cơ bản ──────────────────────── */}
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Tên vị trí"
              rules={[
                { required: true, message: 'Vui lòng nhập tên' },
                { min: 3, message: 'Tối thiểu 3 ký tự' },
              ]}
            >
              <Input placeholder="VD: Banner trang chủ, Interstitial sau tập 3..." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="priority" label="Ưu tiên" tooltip="Số càng cao càng ưu tiên hiển thị">
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Loại quảng cáo"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            >
              <Select options={AD_TYPES} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="platform"
              label="Nền tảng QC"
              rules={[{ required: true, message: 'Chọn nền tảng' }]}
            >
              <Select options={PLATFORMS} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="adUnitId"
          label="Ad Unit ID"
          rules={[{ required: true, message: 'Vui lòng nhập Ad Unit ID' }]}
          tooltip="ID đơn vị quảng cáo từ AdMob/Facebook/Unity"
        >
          <Input
            placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="position"
              label="Vị trí hiển thị"
              rules={[{ required: true, message: 'Chọn vị trí' }]}
            >
              <Select
                showSearch
                options={POSITION_PRESETS}
                placeholder="Chọn hoặc tìm kiếm vị trí..."
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) || false
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="targetPlatforms"
              label="Thiết bị mục tiêu"
              rules={[{ required: true, message: 'Chọn ít nhất 1 thiết bị' }]}
            >
              <Select mode="multiple" options={TARGET_PLATFORMS as any} placeholder="Chọn thiết bị" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} placeholder="Mô tả ngắn về vị trí quảng cáo này..." />
        </Form.Item>

        {/* ── Tần suất ──────────────────────────────── */}
        <Divider titlePlacement="left" style={{ fontSize: 13 }}>⏱️ Kiểm soát tần suất</Divider>

        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item
              name="frequency"
              label="Mỗi (phút)"
              tooltip="Hiển thị mỗi N phút, 0 = mỗi lần"
            >
              <InputNumber min={0} max={1440} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="maxPerSession"
              label="Max/phiên"
              tooltip="0 = không giới hạn"
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="maxPerDay"
              label="Max/ngày"
              tooltip="0 = không giới hạn"
            >
              <InputNumber min={0} max={1000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="cooldownSeconds"
              label="Cooldown (giây)"
              tooltip="Thời gian chờ giữa 2 lần hiển thị"
            >
              <InputNumber min={0} max={3600} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {/* ── Reward config (only for REWARD_VIDEO) ── */}
        {adType === 'REWARD_VIDEO' && (
          <>
            <Divider titlePlacement="left" style={{ fontSize: 13 }}>🎁 Cấu hình phần thưởng</Divider>
            <Alert
              message="Người dùng sẽ nhận thưởng sau khi xem hết video quảng cáo"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="rewardGold"
                  label="Vàng thưởng"
                  tooltip="Số vàng người dùng nhận được"
                >
                  <InputNumber min={0} max={10000} style={{ width: '100%' }} addonAfter="🪙" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="rewardMultiplier"
                  label="Hệ số nhân"
                  tooltip="Nhân với giá trị mặc định (VD: 2x = gấp đôi)"
                >
                  <InputNumber min={1} max={10} step={0.5} style={{ width: '100%' }} addonAfter="x" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* ── Trạng thái ────────────────────────────── */}
        <Divider titlePlacement="left" style={{ fontSize: 13 }}>⚙️ Trạng thái</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="excludeVip" label="Ẩn với VIP" valuePropName="checked">
              <Switch checkedChildren="Ẩn VIP" unCheckedChildren="Hiển thị VIP" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
              <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
