'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Compass, Play, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/search', icon: Search, label: 'Tìm kiếm' },
  { href: '/category/trending', icon: Compass, label: 'Khám phá' },
  { href: '/category/phim-bo', icon: Play, label: 'Phim bộ' },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const accountItem = isAuthenticated
    ? { href: '/account/profile', icon: User, label: 'Tài khoản' }
    : { href: '/login', icon: User, label: 'Đăng nhập' };

  const allItems = [...navItems, accountItem];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-14">
        {allItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive(href) ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
