'use client';

import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAdminUIStore } from '@/stores/adminUIStore';

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { sidebarCollapsed, breadcrumbs } = useAdminUIStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin 0.2s' }}>
        <AdminHeader />
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          {breadcrumbs.length > 0 && (
            <Breadcrumb
              style={{ marginBottom: 16 }}
              items={breadcrumbs.map((b) => ({
                title: b.path ? <a href={b.path}>{b.title}</a> : b.title,
              }))}
            />
          )}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
