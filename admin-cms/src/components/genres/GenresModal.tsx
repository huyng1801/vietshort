'use client';

import { Modal, Form, Input, InputNumber, Switch, Space } from 'antd';
import type { FormInstance } from 'antd';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import type { Genre } from '@/types/admin';
import adminAPI from '@/lib/admin-api';

interface GenresModalProps {
  open: boolean;
  editingGenre: Genre | null;
  form: FormInstance;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

// Hàm remove diacritics (dấu) từ tiếng Việt
const removeDiacritics = (text: string): string => {
  const vietnameseMap: Record<string, string> = {
    'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'Á': 'a', 'À': 'a', 'Ả': 'a', 'Ã': 'a', 'Ạ': 'a',
    'Ă': 'a', 'Ắ': 'a', 'Ằ': 'a', 'Ẳ': 'a', 'Ẵ': 'a', 'Ặ': 'a',
    'Â': 'a', 'Ấ': 'a', 'Ầ': 'a', 'Ẩ': 'a', 'Ẫ': 'a', 'Ậ': 'a',
    'É': 'e', 'È': 'e', 'Ẻ': 'e', 'Ẽ': 'e', 'Ẹ': 'e',
    'Ê': 'e', 'Ế': 'e', 'Ề': 'e', 'Ể': 'e', 'Ễ': 'e', 'Ệ': 'e',
    'Í': 'i', 'Ì': 'i', 'Ỉ': 'i', 'Ĩ': 'i', 'Ị': 'i',
    'Ó': 'o', 'Ò': 'o', 'Ỏ': 'o', 'Õ': 'o', 'Ọ': 'o',
    'Ô': 'o', 'Ố': 'o', 'Ồ': 'o', 'Ổ': 'o', 'Ỗ': 'o', 'Ộ': 'o',
    'Ơ': 'o', 'Ớ': 'o', 'Ờ': 'o', 'Ở': 'o', 'Ỡ': 'o', 'Ợ': 'o',
    'Ú': 'u', 'Ù': 'u', 'Ủ': 'u', 'Ũ': 'u', 'Ụ': 'u',
    'Ư': 'u', 'Ứ': 'u', 'Ừ': 'u', 'Ử': 'u', 'Ữ': 'u', 'Ự': 'u',
    'Ý': 'y', 'Ỳ': 'y', 'Ỷ': 'y', 'Ỹ': 'y', 'Ỵ': 'y',
    'Đ': 'd',
  };

  return text
    .split('')
    .map(char => vietnameseMap[char] || char)
    .join('');
};

// Hàm generate slug từ tên
const generateSlug = (text: string): string => {
  if (!text) return '';
  return removeDiacritics(text)
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-') // Thay spaces bằng dấu gạch ngang
    .replace(/[^\w-]/g, '') // Xóa ký tự đặc biệt
    .replace(/[-]+/g, '-') // Gộp nhiều dấu gạch ngang thành 1
    .replace(/^-+|-+$/g, ''); // Xóa dấu gạch ngang ở đầu và cuối
};

export default function GenresModal({
  open,
  editingGenre,
  form,
  saving,
  onCancel,
  onSubmit,
}: GenresModalProps): ReactNode {
  const [maxSortOrder, setMaxSortOrder] = useState(0);

  // Auto-generate slug khi name thay đổi
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    // Chỉ auto-generate nếu slug trống hoặc khi tạo mới
    if (newName && !editingGenre) {
      form.setFieldValue('slug', generateSlug(newName));
    }
  };

  // Lấy max sortOrder khi component mount
  useEffect(() => {
    const fetchMaxSortOrder = async () => {
      try {
        const res = await adminAPI.getMaxSortOrder();
        setMaxSortOrder(res.data.maxSortOrder || 0);
      } catch (err) {
        setMaxSortOrder(0);
      }
    };
    fetchMaxSortOrder();
  }, []);

  // Setup form values khi modal open hoặc editingGenre thay đổi
  useEffect(() => {
    if (!open) return;

    // Refetch max sortOrder khi modal mở
    const fetchMaxSortOrder = async () => {
      try {
        const res = await adminAPI.getMaxSortOrder();
        setMaxSortOrder(res.data.maxSortOrder || 0);
      } catch (err) {
        setMaxSortOrder(0);
      }
    };
    fetchMaxSortOrder();

    // Reset form trước
    form.resetFields();

    // Dùng setTimeout để đảm bảo form reset hoàn tất
    setTimeout(() => {
      if (editingGenre) {
        // Chỉnh sửa: set giá trị từ genre
        form.setFieldsValue({
          name: editingGenre.name,
          slug: editingGenre.slug,
          description: editingGenre.description || '',
          sortOrder: editingGenre.sortOrder,
          isActive: editingGenre.isActive,
        });
      } else {
        // Tạo mới: set sortOrder tiếp theo
        form.setFieldsValue({
          sortOrder: maxSortOrder + 1,
          isActive: true,
        });
      }
    }, 100);
  }, [open, editingGenre, maxSortOrder, form]);
  return (
    <Modal
      title={editingGenre ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={saving}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnHidden
      width={520}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} preserve={false}>
        <Form.Item
          name="name"
          label="Tên thể loại"
          rules={[
            { required: true, message: 'Vui lòng nhập tên thể loại' },
            { max: 100, message: 'Tối đa 100 ký tự' },
          ]}
        >
          <Input placeholder="VD: Hành động, Tình cảm, Kinh dị..." onChange={handleNameChange} />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: 'Slug không được để trống' },
            { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' },
          ]}
        >
          <Input placeholder="VD: hanh-dong" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ max: 500, message: 'Tối đa 500 ký tự' }]}
        >
          <Input.TextArea rows={3} placeholder="Mô tả ngắn về thể loại" />
        </Form.Item>

        <Space size="large">
          <Form.Item name="sortOrder" label="Thứ tự sắp xếp" initialValue={0}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
}
