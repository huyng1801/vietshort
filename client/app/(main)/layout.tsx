'use client';
import { usePathname } from 'next/navigation';
import { Header, Footer, MobileNavigation } from '@/components/layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWatchPage = pathname?.startsWith('/watch');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!isWatchPage && <Header />}
      <main className="min-h-screen">{children}</main>
      {!isWatchPage && <Footer />}
      {!isWatchPage && <MobileNavigation />}
    </div>
  );
}
