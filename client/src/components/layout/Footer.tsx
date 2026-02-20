'use client';

import Link from 'next/link';
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

const footerSections = [
  {
    title: 'Nội dung',
    links: [
      { label: 'Phim bộ', href: '/category/phim-bo' },
      { label: 'Phim lẻ', href: '/category/phim-le' },
      { label: 'Xu hướng', href: '/category/trending' },
      { label: 'Mới cập nhật', href: '/category/new' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Trung tâm hỗ trợ', href: '/help' },
      { label: 'Câu hỏi thường gặp', href: '/faq' },
      { label: 'Liên hệ', href: '/contact' },
    ],
  },
  {
    title: 'Pháp lý',
    links: [
      { label: 'Điều khoản sử dụng', href: '/terms' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'DMCA', href: '/dmca' },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800/50 mt-10">
      <div className="w-full px-4 sm:px-6 lg:px-32 mx-auto pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-500 text-xs sm:text-xs lg:text-sm mb-4 sm:mb-6 max-w-md">
              Nền tảng xem phim ngắn trực tuyến hàng đầu Việt Nam.
            </p>
            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm sm:text-sm lg:text-base mb-2 sm:mb-3 lg:mb-4">{title}</h3>
              <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-500 hover:text-white text-xs sm:text-xs lg:text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800/50 pt-4 sm:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-gray-600 text-xs sm:text-xs lg:text-sm">
            © {new Date().getFullYear()} VietShort. Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-xs lg:text-sm text-gray-600">
            <span className="flex items-center gap-2 sm:gap-2">
              <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> support@vietshort.vn
            </span>
            <span className="flex items-center gap-2 sm:gap-2">
              <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> 1900 1234
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
