'use client';

import { memo } from 'react';
import { Card, Space, Button, Popconfirm, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface CommentsBulkActionsProps {
  selectedCount: number;
  onApproveAll: () => void;
  onHideAll: () => void;
  onDeleteAll: () => void;
}

export default memo(function CommentsBulkActions({
  selectedCount,
  onApproveAll,
  onHideAll,
  onDeleteAll,
}: CommentsBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <Card size="small" className="mb-4">
      <Space>
        <Text>Đã chọn {selectedCount} bình luận:</Text>
        <Button size="small" type="primary" icon={<CheckOutlined />} onClick={onApproveAll}>
          Duyệt tất cả
        </Button>
        <Button size="small" icon={<CloseOutlined />} onClick={onHideAll}>
          Ẩn tất cả
        </Button>
        <Popconfirm title={`Xóa ${selectedCount} bình luận?`} onConfirm={onDeleteAll}>
          <Button size="small" danger icon={<DeleteOutlined />}>Xóa tất cả</Button>
        </Popconfirm>
      </Space>
    </Card>
  );
});
