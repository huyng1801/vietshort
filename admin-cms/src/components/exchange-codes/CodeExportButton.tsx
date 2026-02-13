'use client';

import React, { useState } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';

interface CodeExportButtonProps {
  batchId: string;
  batchName: string;
}

export default function CodeExportButton({ batchId, batchName }: CodeExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.exportCodes(batchId);
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codes_${batchName.replace(/\s+/g, '_')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Đã xuất file');
    } catch {
      message.error('Xuất file thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button icon={<DownloadOutlined />} onClick={handleExport} loading={loading}>
      Xuất Excel
    </Button>
  );
}
