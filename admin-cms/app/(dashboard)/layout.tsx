'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLayout from '@/components/layout/AdminLayout';
import { Spin } from 'antd';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAdminAuth(true); // true = require auth

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" fullscreen />
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
