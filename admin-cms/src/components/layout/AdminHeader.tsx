'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Badge, Space, Typography } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { useAdminUIStore } from '@/stores/adminUIStore';
import { logoutAdmin } from '@/lib/admin-auth';

const { Header } = Layout;
const { Text } = Typography;

export default function AdminHeader() {
  const { user } = useAdminAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useAdminUIStore();

  const menuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logoutAdmin();
    }
  };

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {React.createElement(sidebarCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          onClick: toggleSidebar,
          style: { fontSize: 18, cursor: 'pointer' },
        })}
      </div>

      <Space size={20}>
        <Badge count={5} size="small">
          <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
        </Badge>

        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} src={user?.avatar} />
            <Text strong>{user?.nickname || user?.email || 'Admin'}</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
