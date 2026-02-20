'use client';

import Link from 'next/link';

interface LogoProps {
  hideText?: boolean;
}

export function Logo({ hideText = false }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF5CA7 0%, #FF3D3D 75%, #FFB86C 100%)' }}>
        <span className="text-white text-lg sm:text-xl lg:text-2xl tracking-widest" style={{ fontFamily: 'Lobster, cursive' }}>V</span>
      </div>
      {!hideText && (
        <span className="hidden sm:block text-lg sm:text-xl lg:text-xl text-white tracking-wider" style={{ fontFamily: 'Lobster, cursive' }}>VietShort</span>
      )}
    </Link>
  );
}
