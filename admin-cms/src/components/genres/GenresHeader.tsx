'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface GenresHeaderProps {
  onAddClick: () => void;
}

export default function GenresHeader({ onAddClick }: GenresHeaderProps): ReactNode {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold m-0">Quản lý thể loại</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
        Thêm thể loại
      </Button>
    </div>
  );
}
