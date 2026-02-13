'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface BannersHeaderProps {
  onAdd: () => void;
}

export default function BannersHeader({ onAdd }: BannersHeaderProps): ReactNode {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold m-0">Quản lý Banner</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
        Thêm banner
      </Button>
    </div>
  );
}