'use client';

import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: string;
}

// Mapping routes to readable names
const ROUTE_NAMES: Record<string, string> = {
  // Dashboard
  '': 'Tổng quan',
  
  // Videos
  'videos': 'Quản lý Video',
  'create': 'Tạo mới',
  'edit': 'Chỉnh sửa',
  
  // Users
  'users': 'Quản lý Người dùng',
  
  // Genres
  'genres': 'Quản lý Thể loại',
  
  // Banners
  'banners': 'Quản lý Banner',
  
  // CTV
  'ctv-management': 'Quản lý CTV',
  
  // Exchange codes
  'exchange-codes': 'Mã đổi quà',
  
  // Gamification
  'gamification': 'Trò chơi hóa',
  'daily-tasks': 'Nhiệm vụ hằng ngày',
  'achievements': 'Thành tích',
  'check-in-rewards': 'Điểm danh - Phần thưởng',
  
  // Subtitles
  'subtitles': 'Phụ đề',
  
  // Encoding
  'encoding-queue': 'Hàng đợi Encoding',
  
  // Social
  'social': 'Mạng xã hội',
  'comments': 'Bình luận',
  'ratings': 'Đánh giá',
  'favorites': 'Yêu thích',
  
  // Reports
  'reports': 'Báo cáo',
  
  // Settings
  'settings': 'Cài đặt',
  
  // Profile
  'profile': 'Hồ sơ',
};

export default function Breadcrumb({ items, separator = '/' }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumb from pathname if items not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items) {
      return items.map((item, index) => ({
        key: index,
        title: item.href ? (
          <Link href={item.href}>
            {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
            {item.title}
          </Link>
        ) : (
          <>
            {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
            {item.title}
          </>
        ),
      }));
    }

    // Auto-generate from pathname
    const paths = pathname.split('/').filter(Boolean);
    
    // Home item
    const autoItems: Array<{ key: string; title: React.ReactNode }> = [
      {
        key: 'home',
        title: (
          <Link href="/">
            <HomeOutlined style={{ marginRight: 4 }} />
            Trang chủ
          </Link>
        ),
      },
    ];

    // Build breadcrumb from path segments
    let currentPath = '';
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip if it's a UUID/ID (dynamic route)
      const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
      
      if (isId) {
        // For ID segments, just show "Chi tiết" without link
        autoItems.push({
          key: currentPath,
          title: <span>Chi tiết</span>,
        });
        return;
      }

      const name = ROUTE_NAMES[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Last item is not a link
      if (index === paths.length - 1) {
        autoItems.push({
          key: currentPath,
          title: <span>{name}</span>,
        });
      } else {
        autoItems.push({
          key: currentPath,
          title: <Link href={currentPath}>{name}</Link>,
        });
      }
    });

    return autoItems;
  }, [pathname, items]);

  return (
    <AntBreadcrumb
      separator={separator}
      items={breadcrumbItems}
      style={{ marginBottom: 16 }}
    />
  );
}
