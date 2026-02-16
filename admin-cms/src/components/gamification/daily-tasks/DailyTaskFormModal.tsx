'use client';

import { Modal, Form, Input, InputNumber, Select, Switch, Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type { DailyTask } from '@/types';
import { DAILY_TASK_TYPE_LABELS } from '@/types';

const TASK_TYPE_OPTIONS = Object.entries(DAILY_TASK_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface DailyTaskFormModalProps {
  open: boolean;
  editing: DailyTask | null;
  form: FormInstance;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function DailyTaskFormModal({
  open,
  editing,
  form,
  onSubmit,
  onCancel,
}: DailyTaskFormModalProps) {
  return (
    <Modal
      title={editing ? 'Sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={editing ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      width={520}
      destroyOnHidden
      maskClosable={true}
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
  );
}
