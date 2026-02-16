import { useEffect } from 'react';
import { useAdminUIStore } from '@/stores/adminUIStore';

interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

/**
 * Hook to set custom breadcrumb items for a page
 * Auto-cleanup when component unmounts
 * 
 * @example
 * useBreadcrumb([
 *   { title: 'Trang chủ', href: '/', icon: <HomeOutlined /> },
 *   { title: 'Videos', href: '/videos' },
 *   { title: 'Chi tiết' }
 * ]);
 */
export function useBreadcrumb(items?: BreadcrumbItem[]) {
  useEffect(() => {
    if (items) {
      useAdminUIStore.setState({ breadcrumbItems: items });
    }

    // Cleanup
    return () => {
      useAdminUIStore.setState({ breadcrumbItems: undefined });
    };
  }, [items]);
}
