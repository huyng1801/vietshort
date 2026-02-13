'use client';

import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface UsersHeaderProps {
  onRefresh: () => void;
}

export default function UsersHeader({ onRefresh }: UsersHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold m-0">Quản lý người dùng</h1>
      <Button icon={<ReloadOutlined />} onClick={onRefresh}>
        Làm mới
      </Button>
    </div>
  );
}
