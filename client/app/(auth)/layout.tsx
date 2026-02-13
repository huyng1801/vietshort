import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="p-4 lg:p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">V</span>
          </div>
          <span className="text-lg font-bold text-white">VietShort</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">{children}</main>
      <footer className="p-4 text-center text-gray-600 text-xs">
        <p>© {new Date().getFullYear()} VietShort</p>
      </footer>
    </div>
  );
}
