'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Bell, User, Menu, X, Crown, Wallet, Settings,
  LogOut, History, Bookmark, ChevronDown, Gift,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { SearchBar } from '@/components/search/SearchBar';
import { CATEGORIES } from '@/lib/constants';

const mainNavItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/category/phim-bo', label: 'Phim bộ' },
  { href: '/category/phim-le', label: 'Phim lẻ' },
  { href: '/category/trending', label: 'Xu hướng' },
];

const moreNavItems = CATEGORIES.filter(
  (c) => !['phim-bo', 'phim-le'].includes(c.slug),
).map((c) => ({ href: `/category/${c.slug}`, label: c.name }));

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-950/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
        <div className="flex items-center h-14 lg:h-16">
          {/* Mobile menu */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white mr-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-6 lg:mr-10 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">V</span>
            </div>
            <span className="hidden sm:block text-lg font-bold text-white">VietShort</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {mainNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3.5 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(href)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded text-sm font-medium transition-colors ${
                  isMoreOpen ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Xem thêm
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMoreOpen && (
                <div className="absolute top-full left-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl py-2 z-50 min-w-[320px]">
                  <div className="grid grid-cols-2 gap-0.5 p-1">
                    {moreNavItems.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              className="p-2 text-gray-300 hover:text-white"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>

            {!isMounted ? (
              <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <button className="relative p-2 text-gray-300 hover:text-white hidden sm:block">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {user?.vipType === 'NORMAL' ? (
                  <Link
                    href="/account/vip"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold rounded-full transition-all"
                  >
                    Mua gói
                  </Link>
                ) : (
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-yellow-500/15 rounded-full border border-yellow-500/30">
                    <Crown className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-yellow-500 text-xs font-semibold">
                      {user?.vipType === 'VIP_GOLD' ? 'Gold' : 'FreeAds'}
                    </span>
                  </div>
                )}

                <div className="relative" ref={profileRef}>
                  <button
                    className="flex items-center p-1 rounded-full hover:bg-white/10 transition-colors"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-800">
                        <p className="text-white font-medium truncate text-sm">{user?.nickname}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Wallet className="w-3 h-3 text-yellow-500" />
                          <span className="text-yellow-500 text-xs">{user?.goldBalance || 0} Gold</span>
                        </div>
                      </div>
                      <div className="py-1">
                        {[
                          { href: '/account/history', icon: History, label: 'Lịch sử xem' },
                          { href: '/account/bookmarks', icon: Bookmark, label: 'Đánh dấu' },
                          { href: '/account/vip', icon: Crown, label: 'Nâng cấp VIP' },
                          { href: '/account/settings', icon: Settings, label: 'Cài đặt' },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link key={href} href={href} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white text-sm">
                            <Icon className="w-4 h-4" /> {label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-800 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-white/5 w-full text-sm">
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/account/vip"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full"
                >
                  Mua gói
                </Link>
                <Link href="/login" className="px-3 py-1.5 text-sm text-white font-medium">
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>

        {isSearchOpen && (
          <div className="pb-3">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-950/98 backdrop-blur-md border-t border-gray-800 max-h-[70vh] overflow-y-auto">
          <nav className="px-4 py-3 space-y-0.5">
            {mainNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium ${
                  isActive(href) ? 'text-white bg-white/10' : 'text-gray-300'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-gray-800 pt-2 mt-2">
              <p className="px-3 py-1 text-xs text-gray-500 font-semibold uppercase">Thể loại</p>
              <div className="grid grid-cols-2 gap-0.5">
                {moreNavItems.map(({ href, label }) => (
                  <Link key={href} href={href} className="py-2 px-3 text-sm text-gray-400 hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
