import Link from 'next/link';
import { Logo } from '@/components/common';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-600/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-12 py-4 sm:py-5 lg:py-6">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-4 sm:py-5 text-center">
        <p className="text-gray-600 text-xs sm:text-sm">
          © {new Date().getFullYear()} VietShort · Nền tảng xem phim ngắn hàng đầu Việt Nam
        </p>
      </footer>
    </div>
  );
}
