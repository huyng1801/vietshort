'use client';

import React from 'react';
import { Button, Dropdown } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

interface ExportButtonProps {
  onExportExcel?: () => void;
  onExportCSV?: () => void;
  loading?: boolean;
}

export default function ExportButton({ onExportExcel, onExportCSV, loading }: ExportButtonProps) {
  const items = [
    ...(onExportExcel ? [{ key: 'excel', label: 'Xuất Excel (.xlsx)', onClick: onExportExcel }] : []),
    ...(onExportCSV ? [{ key: 'csv', label: 'Xuất CSV (.csv)', onClick: onExportCSV }] : []),
  ];

  if (items.length === 1) {
    return (
      <Button icon={<DownloadOutlined />} loading={loading} onClick={items[0].onClick}>
        {items[0].label}
      </Button>
    );
  }

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button icon={<DownloadOutlined />} loading={loading}>
        Xuất dữ liệu
      </Button>
    </Dropdown>
  );
}
