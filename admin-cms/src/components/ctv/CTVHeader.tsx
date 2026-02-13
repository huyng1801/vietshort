'use client';

import { Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

interface CTVHeaderProps {
  onRefresh: () => void;
  onAdd: () => void;
}

export default function CTVHeader({ onRefresh, onAdd }: CTVHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold m-0">Quản lý CTV (Cộng tác viên)</h1>
      <Space>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Làm mới
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Thêm CTV
        </Button>
      </Space>
    </div>
  );
}
