'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Gift, User, Wallet } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const leftNavItems = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/search', icon: Search, label: 'Tìm kiếm' },
];

const rightNavItems = [
  { href: '/wallet', icon: Wallet, label: 'Ví' },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const accountItem = isAuthenticated
    ? { href: '/settings', icon: User, label: 'Cá nhân' }
    : { href: '/login', icon: User, label: 'Đăng nhập' };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 lg:hidden safe-area-bottom">
      <div className="relative flex items-end justify-between h-16 px-2">
        {/* Left items */}
        <div className="flex flex-1 justify-around items-center h-14">
          {leftNavItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors min-w-[60px] ${
                isActive(href) ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* Center - Prominent Rewards Button */}
        <Link
          href="/rewards"
          className={`flex flex-col items-center justify-center -mt-6 transition-all ${
            isActive('/rewards') ? 'scale-100' : 'scale-95 hover:scale-100'
          }`}
        >
          <div className={`relative rounded-2xl p-3 shadow-xl transition-all ${
            isActive('/rewards')
              ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/50'
              : 'bg-gradient-to-br from-red-600 to-red-700 shadow-red-600/30'
          }`}>
            <Gift className="w-7 h-7 text-white" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-400/20 to-transparent animate-pulse" />
          </div>
          <span className={`text-[10px] font-semibold mt-1 ${
            isActive('/rewards') ? 'text-red-500' : 'text-gray-400'
          }`}>
            Sự kiện
          </span>
        </Link>

        {/* Right items */}
        <div className="flex flex-1 justify-around items-center h-14">
          {rightNavItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors min-w-[60px] ${
                isActive(href) ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
          <Link
            href={accountItem.href}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors min-w-[60px] ${
              isActive(accountItem.href) ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <accountItem.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{accountItem.label}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
