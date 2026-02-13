'use client';

import Link from 'next/link';
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';

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
    <footer className="bg-gray-950 border-t border-gray-800/50 mt-12">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="text-lg font-bold text-white">VietShort</span>
            </Link>
            <p className="text-gray-500 text-sm mb-4 max-w-xs">
              Nền tảng xem phim ngắn trực tuyến hàng đầu Việt Nam.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-500 hover:text-white text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} VietShort. Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> support@vietshort.vn
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> 1900 1234
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
