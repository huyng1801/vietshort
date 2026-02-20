'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  PictureOutlined,
  AppstoreOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  TeamOutlined,
  GiftOutlined,
  CloudUploadOutlined,
  FileSearchOutlined,
  DollarOutlined,
  TagsOutlined,
  IdcardOutlined,
  TrophyOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminUIStore } from '@/stores/adminUIStore';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'videos',
    icon: <VideoCameraOutlined />,
    label: 'Nội dung',
    children: [
      { key: '/videos', label: 'Quản lý Video' },
      { key: '/subtitles', label: 'Phụ đề' },
    ],
  },
  {
    key: '/banners',
    icon: <PictureOutlined />,
    label: 'Banner',
  },
  {
    key: '/genres',
    icon: <TagsOutlined />,
    label: 'Thể loại',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: 'Người dùng',
  },
  {
    key: 'social',
    icon: <CommentOutlined />,
    label: 'Tương tác xã hội',
    children: [
      { key: '/social/comments', label: 'Bình luận' },
      { key: '/social/ratings', label: 'Đánh giá' },
      { key: '/social/video-interactions', label: 'Sưu tầm & Yêu thích' },
    ],
  },
  {
    key: 'ctv',
    icon: <TeamOutlined />,
    label: 'Quản lý CTV',
    children: [
      { key: '/ctv-management', label: 'Danh sách CTV' },
      { key: '/ctv-management/payouts', label: 'Yêu cầu rút tiền' },
    ],
  },
  {
    key: '/exchange-codes',
    icon: <GiftOutlined />,
    label: 'Lô mã đổi quà',
  },
  {
    key: 'gamification',
    icon: <TrophyOutlined />,
    label: 'Trò chơi hóa',
    children: [
      { key: '/gamification/daily-tasks', label: 'Nhiệm vụ hằng ngày' },
      { key: '/gamification/achievements', label: 'Thành tích' },
      { key: '/gamification/check-in-rewards', label: 'Điểm danh - Phần thưởng' },
    ],
  },
  {
    key: '/reports',
    icon: <BarChartOutlined />,
    label: 'Báo cáo & Phân tích',
  },
  {
    key: '/profile',
    icon: <IdcardOutlined />,
    label: 'Thông tin cá nhân',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Cài đặt',
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed } = useAdminUIStore();

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  // Determine selected key from pathname
  const getSelectedKey = () => {
    // Exact match first
    const exact = menuItems.flatMap((item) =>
      'children' in item && item.children ? item.children.map((c) => c.key) : [item.key],
    );
    const found = exact.find((k) => pathname === k);
    if (found) return found;

    // Prefix match
    const prefix = exact
      .filter((k) => pathname.startsWith(k) && k !== '/dashboard')
      .sort((a, b) => b.length - a.length);
    return prefix[0] || '/dashboard';
  };

  // Determine open keys
  const getOpenKeys = () => {
    const selected = getSelectedKey();
    return menuItems
      .filter(
        (item) =>
          'children' in item && item.children?.some((c) => selected.startsWith(c.key)),
      )
      .map((item) => item.key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={sidebarCollapsed}
      width={260}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 101,
      }}
      theme="dark"
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontSize: sidebarCollapsed ? 16 : 20,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {sidebarCollapsed ? 'VS' : '🎬 VietShort Admin'}
        </span>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  );
}
