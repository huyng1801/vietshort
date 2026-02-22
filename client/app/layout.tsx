import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'VietShort - Phim ngắn Việt Nam',
  description: 'Nền tảng xem phim ngắn hàng đầu Việt Nam',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased dark`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}