'use client';

import React from 'react';
import { Layout } from 'antd';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAdminUIStore } from '@/stores/adminUIStore';

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { sidebarCollapsed, breadcrumbItems } = useAdminUIStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin 0.2s' }}>
        <AdminHeader />
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Breadcrumb items={breadcrumbItems} />
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
