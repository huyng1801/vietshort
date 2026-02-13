'use client';

import { Popconfirm, Button, Tooltip, Space } from 'antd';
import { DeleteOutlined, QuestionsOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { Genre } from '@/types/admin';

interface DeleteConfirmPopoverProps {
  genre: Genre;
  onConfirm: (genre: Genre) => Promise<void>;
  loading?: boolean;
}

export default function DeleteConfirmPopover({ genre, onConfirm, loading }: DeleteConfirmPopoverProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(genre);
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const hasVideos = (genre.videoCount ?? 0) > 0;

  const description = (
    <div style={{ marginTop: 8 }}>
      <div style={{ marginBottom: 4 }}>
        Bạn có chắc chắn muốn xóa thể loại <strong>"{genre.name}"</strong>?
      </div>
      {hasVideos && (
        <div
          style={{
            backgroundColor: '#fff2e8',
            border: '1px solid #ffbb96',
            borderRadius: 4,
            padding: '4px 8px',
            marginTop: 8,
            fontSize: 12,
            color: '#d46b08',
          }}
        >
          ⚠ Có {genre.videoCount} video gắn liền, không thể xóa!
        </div>
      )}
    </div>
  );

  return (
    <Popconfirm
      title={<span style={{ fontWeight: 600 }}>Xác nhận xóa</span>}
      description={description}
      open={open}
      onOpenChange={(newOpen) => setOpen(newOpen)}
      onConfirm={handleDelete}
      okButtonProps={{ 
        danger: true, 
        loading: deleting,
        disabled: hasVideos 
      }}
      placement="topRight"
      width={hasVideos ? 320 : 280}
    >
      <Tooltip title={hasVideos ? "Không thể xóa khi có video" : "Xóa"}>
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined style={{ fontSize: 14 }} />}
          disabled={loading}
          style={{
            padding: '4px 8px',
            height: 'auto',
          }}
        />
      </Tooltip>
    </Popconfirm>
  );
}

