'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface VideoHeaderProps {
  onAdd: () => void;
}

export default function VideoHeader({ onAdd }: VideoHeaderProps): ReactNode {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold m-0">Quản lý Video</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
        Thêm phim mới
      </Button>
    </div>
  );
}