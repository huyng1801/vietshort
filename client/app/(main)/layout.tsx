'use client';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWatchPage = pathname?.startsWith('/watch');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <main className="min-h-screen">{children}</main>
      {!isWatchPage && <Footer />}
      <MobileNavigation />
    </div>
  );
}
