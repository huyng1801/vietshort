'use client';

import { Modal, Form, Input, InputNumber, Select, Switch, Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type { Achievement } from '@/types';
import {
  ACHIEVEMENT_CONDITION_LABELS,
  ACHIEVEMENT_CATEGORY_LABELS,
} from '@/types';

const CONDITION_OPTIONS = Object.entries(ACHIEVEMENT_CONDITION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_OPTIONS = Object.entries(ACHIEVEMENT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface AchievementFormModalProps {
  open: boolean;
  editing: Achievement | null;
  form: FormInstance;
  onSubmit: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function AchievementFormModal({
  open,
  editing,
  form,
  onSubmit,
  onCancel,
  loading = false,
}: AchievementFormModalProps) {
  return (
    <Modal
      title={editing ? 'Sửa thành tích' : 'Tạo thành tích mới'}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={editing ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      width={560}
      destroyOnHidden
      confirmLoading={loading}
      maskClosable={!loading}
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
  );
}
