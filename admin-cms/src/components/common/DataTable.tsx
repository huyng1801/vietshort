'use client';

import React from 'react';
import { Table, Card } from 'antd';
import type { TableProps } from 'antd';

interface DataTableProps<T> extends TableProps<T> {
  title?: string;
  extra?: React.ReactNode;
}

export default function DataTable<T extends object>({
  title,
  extra,
  ...tableProps
}: DataTableProps<T>) {
  return (
    <Card
      title={title}
      extra={extra}
      styles={{ body: { padding: 0 } }}
    >
      <Table<T>
        {...tableProps}
        scroll={{ x: 'max-content' }}
        size="middle"
        rowKey={tableProps.rowKey || 'id'}
      />
    </Card>
  );
}
