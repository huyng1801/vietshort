import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl mb-4">Không tìm thấy trang</p>
        <p className="text-gray-400 mb-8">
          Trang bạn đang tìm kiếm không tồn tại.
        </p>
        <Link
          href="/"
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}