'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Upload,
  Button,
  Image,
  Row,
  Col,
  message,
  Space,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import adminAPI from '@/lib/admin-api';
import type { Banner } from '@/types/admin';

interface BannerFormModalProps {
  open: boolean;
  banner: Banner | null; // null = create mode
  onClose: () => void;
  onSuccess: () => void;
}

const LINK_TYPES = [
  { label: 'Video', value: 'video' },
  { label: 'Link ngoài', value: 'external' },
  { label: 'Khuyến mãi', value: 'promotion' },
];

const VIP_TYPES = [
  { label: 'Tất cả', value: '' },
  { label: 'VIP FreeAds', value: 'VIP_FREEADS' },
  { label: 'VIP Gold', value: 'VIP_GOLD' },
];

export default function BannerFormModal({ open, banner, onClose, onSuccess }: BannerFormModalProps) {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!banner;
  const linkType = Form.useWatch('linkType', form);

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;

    if (banner) {
      // Edit mode: populate form with existing data
      setImageUrl(banner.imageUrl || '');
      form.setFieldsValue({
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkType: banner.linkType || 'external',
        linkTarget: banner.linkTarget || '',
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
        targetVipType: banner.targetVipType || '',
        startAt: banner.startAt ? dayjs(banner.startAt) : null,
        endAt: banner.endAt ? dayjs(banner.endAt) : null,
      });
    } else {
      // Create mode: fetch max sort order and reset form
      setImageUrl('');
      form.resetFields();
      form.setFieldsValue({
        linkType: 'external',
        isActive: true,
        targetVipType: '',
        sortOrder: 1,
      });

      adminAPI
        .getBannerMaxSortOrder()
        .then((res) => {
          const max = res.data?.maxSortOrder || 0;
          form.setFieldValue('sortOrder', max + 1);
        })
        .catch(() => {});
    }
  }, [open, banner, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // For edit: if no new image uploaded, keep the old one
      const finalImageUrl = values.imageUrl || imageUrl;
      if (!finalImageUrl) {
        message.error('Vui lòng tải lên hoặc nhập URL hình ảnh');
        return;
      }

      // Validate dates
      if (values.startAt && values.endAt && values.startAt.isAfter(values.endAt)) {
        message.error('Ngày bắt đầu không thể sau ngày kết thúc');
        return;
      }

      setSubmitting(true);

      const submitData: Record<string, unknown> = {
        title: values.title?.trim(),
        imageUrl: finalImageUrl,
        linkType: values.linkType,
        linkTarget: values.linkTarget?.trim() || undefined,
        sortOrder: values.sortOrder,
        targetVipType: values.targetVipType === '' ? null : values.targetVipType || null,
        startAt: values.startAt?.toISOString() || null,
        endAt: values.endAt?.toISOString() || null,
      };

      if (isEdit) {
        submitData.isActive = values.isActive !== false;
        await adminAPI.updateBanner(banner.id, submitData);
        message.success('Đã cập nhật banner thành công!');
      } else {
        await adminAPI.createBanner(submitData);
        message.success('Đã tạo banner mới thành công!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      console.error('Banner save error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể lưu banner';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadChange = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }

    if (info.file.status === 'done') {
      const response = info.file.response;
      if (response?.success && response?.data?.url) {
        const url = response.data.url;
        setImageUrl(url);
        form.setFieldValue('imageUrl', url);
        message.success('Upload hình ảnh thành công');
      } else {
        message.error('Phản hồi không hợp lệ từ server');
      }
    } else if (info.file.status === 'error') {
      const errorMsg = info.file.response?.message || info.file.error?.message || 'Upload hình ảnh thất bại';
      message.error(errorMsg);
    }
  };

  const customUpload = async ({ file, onSuccess, onError, onProgress }: any) => {
    try {
      onProgress({ percent: 10 });
      
      const response = await adminAPI.uploadBannerImage(file);
      
      onProgress({ percent: 100 });
      onSuccess(response.data, file);
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Upload thất bại';
      onError(new Error(errorMsg));
    }
  };

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={isEdit ? 'Cập nhật' : 'Tạo banner'}
      cancelText="Hủy"
      width={680}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề' },
            { min: 3, message: 'Tiêu đề tối thiểu 3 ký tự' },
          ]}
        >
          <Input placeholder="Tiêu đề banner" allowClear />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name="imageUrl"
          rules={[{ required: !isEdit, message: 'Vui lòng cung cấp hình ảnh' }]}
          tooltip={isEdit ? 'Bỏ trống để giữ ảnh cũ' : 'Tải lên hình ảnh hoặc dán URL'}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Upload
                customRequest={customUpload}
                accept="image/*"
                maxCount={1}
                onChange={handleUploadChange}
                showUploadList={false}
                name="image"
              >
                <Button icon={<UploadOutlined />}>Tải lên</Button>
              </Upload>
              <span style={{ color: '#999', fontSize: 13 }}>hoặc</span>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setImageUrl(url);
                  form.setFieldValue('imageUrl', url);
                }}
                style={{ flex: 1 }}
                allowClear
                onClear={() => {
                  setImageUrl('');
                  form.setFieldValue('imageUrl', '');
                }}
              />
            </div>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="preview"
                width={300}
                height={90}
                style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #d9d9d9' }}
              />
            )}
            {isEdit && !imageUrl && banner?.imageUrl && (
              <div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Ảnh hiện tại (sẽ giữ nguyên nếu không thay đổi):</div>
                <Image
                  src={banner.imageUrl}
                  alt="current"
                  width={300}
                  height={90}
                  style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #d9d9d9', opacity: 0.7 }}
                />
              </div>
            )}
          </Space>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại liên kết"
              name="linkType"
              rules={[{ required: true, message: 'Chọn loại liên kết' }]}
            >
              <Select placeholder="Chọn loại liên kết" options={LINK_TYPES} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={linkType === 'video' ? 'ID Video' : linkType === 'external' ? 'URL liên kết' : 'Mục tiêu'}
              name="linkTarget"
            >
              <Input
                placeholder={
                  linkType === 'video'
                    ? 'VD: dQw4w9WgXcQ'
                    : linkType === 'external'
                      ? 'https://example.com'
                      : 'Nhập mục tiêu'
                }
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Ngày bắt đầu" name="startAt">
              <DatePicker showTime allowClear style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ngày kết thúc" name="endAt">
              <DatePicker showTime allowClear style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Đối tượng" name="targetVipType">
              <Select placeholder="Chọn đối tượng" options={VIP_TYPES} allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Thứ tự"
              name="sortOrder"
              rules={[{ required: true, message: 'Nhập thứ tự' }]}
            >
              <InputNumber min={1} placeholder="Thứ tự" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
              <Switch checkedChildren="Kích hoạt" unCheckedChildren="Ẩn" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
