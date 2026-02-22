'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Bell, Menu, X, Crown, Wallet, Settings,
  LogOut, History, Bookmark, ChevronDown, Gift
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { SearchBar } from '@/components/search';
import { Logo, UserAvatar } from '@/components/common';
import { videoApi } from '@/lib/api';


const mainNavItems = [
  { href: '/', label: 'Trang chủ' },
];

interface Genre {
  id: string;
  name: string;
  slug: string;
}

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
  const [genres, setGenres] = useState<Genre[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fetch genres từ API
    const fetchGenres = async () => {
      try {
        const data = await videoApi.genres();
        setGenres(data || []);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
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

      <div className="mx-auto px-3 sm:px-4 lg:px-32">
        <div className="flex items-center h-14 sm:h-14 lg:h-16 justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-10">
            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Logo */}
            <Logo/>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              {mainNavItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    isActive(href)
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div
                className="relative group"
                ref={moreRef}
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
              >
                <div
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isMoreOpen ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  Thể loại
                  <ChevronDown className="w-4 h-4" />
                </div>
                {isMoreOpen && genres.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl py-2 z-50 min-w-[380px]">
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {genres.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/search?category=${encodeURIComponent(genre.slug)}`}
                          className="px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Right: Search + Actions + Profile */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <button
              className="p-2 sm:p-2 lg:p-2 text-gray-300 hover:text-white"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
            </button>

            {isAuthenticated && (
              <>
                <Link
                  href="/rewards"
                  className="p-2 sm:p-2 lg:p-2 text-gray-300 hover:text-white transition-colors hidden sm:inline-flex"
                  title="Phần thưởng"
                >
                  <Gift className="w-5 h-5" />
                </Link>
                <Link
                  href="/history"
                  className="p-2 sm:p-2 lg:p-2 text-gray-300 hover:text-white transition-colors hidden sm:inline-flex"
                  title="Lịch sử xem"
                >
                  <History className="w-5 h-5" />
                </Link>
              </>
            )}

            {!isMounted ? (
              <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <button className="relative p-2 text-gray-300 hover:text-white">
                  <Bell className="w-5 h-5 lg:w-5 lg:h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 lg:w-2 lg:h-2 bg-red-500 rounded-full" />
                </button>

                {!user?.vipTier ? (
                  <Link
                    href="/vip"
                    className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm rounded-full transition-all shadow-lg shadow-orange-500/50 hover:shadow-orange-500/75"
                  >
                    Mua gói
                  </Link>
                ) : null}

                <div className="relative" ref={profileRef}>
                  <button
                    className="flex items-center p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <UserAvatar
                      user={user}
                      size="md"
                      showBadge={true}
                    />
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-52 sm:w-56 lg:w-60 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl py-1 z-50">
                      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-800">
                        <p className="text-white font-bold truncate text-sm sm:text-sm lg:text-base">{user?.nickname}</p>
                        <div className="flex items-center gap-2 sm:gap-2 mt-1.5 sm:mt-2">
                          <Wallet className="w-4 h-4 sm:w-4 sm:h-4 lg:w-4 lg:h-4 text-yellow-500" />
                          <span className="text-yellow-500 text-xs sm:text-xs lg:text-sm">{user?.goldBalance || 0} Gold</span>
                        </div>
                      </div>
                      <div className="py-1">
                        {/* Mobile-only: Rewards & History */}
                        <div className="block sm:hidden">
                          <Link href="/rewards" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white text-sm">
                            <Gift className="w-4 h-4" /> Điểm danh
                          </Link>
                          <Link href="/history" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white text-sm">
                            <History className="w-4 h-4" /> Lịch sử xem
                          </Link>
                        </div>
                        {[
                          { href: '/bookmarks', icon: Bookmark, label: 'Đã lưu' },
                          { href: '/wallet', icon: Wallet, label: 'Ví của tôi' },
                          { href: '/vip', icon: Crown, label: 'Nâng cấp VIP' },
                          { href: '/settings', icon: Settings, label: 'Cài đặt' },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link key={href} href={href} className="flex items-center gap-3 sm:gap-3 px-4 sm:px-4 py-2 sm:py-2.5 text-gray-300 hover:bg-white/5 hover:text-white text-sm sm:text-sm lg:text-sm">
                            <Icon className="w-4 h-4 sm:w-4 sm:h-4 lg:w-4 lg:h-4" /> {label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-800 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 sm:gap-3 px-4 sm:px-4 py-2 sm:py-2.5 text-red-400 hover:bg-white/5 w-full text-sm sm:text-sm lg:text-sm">
                          <LogOut className="w-4 h-4 sm:w-4 sm:h-4 lg:w-4 lg:h-4" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 sm:gap-6">
                <Link
                  href="/vip"
                  className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full"
                >
                  Mua gói
                </Link>
                <Link href="/login" className="px-4 py-2 text-sm sm:text-sm lg:text-base text-white">
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
        <div className="lg:hidden bg-gray-950/98 backdrop-blur-md border-t border-gray-800 max-h-[80vh] overflow-y-auto">
          <nav className="px-4 py-4 space-y-1">
            {mainNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block py-3 px-4 sm:py-4 sm:px-6 rounded-xl text-base sm:text-xl ${
                  isActive(href) ? 'text-white bg-white/10' : 'text-gray-300'
                }`}
              >
                {label}
              </Link>
            ))}
            {genres.length > 0 && (
              <div className="border-t border-gray-800 pt-3 mt-3">
                <p className="px-4 py-1 text-xs text-gray-500 font-bold uppercase">Thể loại</p>
                <div className="grid grid-cols-2 gap-1">
                  {genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/search?category=${encodeURIComponent(genre.slug)}`}
                      className="py-2 px-4 sm:py-3 sm:px-6 text-sm sm:text-lg text-gray-400 hover:text-white"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
