import { History, Play } from 'lucide-react';
import Link from 'next/link';

export function HistoryEmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <History className="w-10 h-10 text-gray-600" />
      </div>
      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3">
        Chưa có lịch sử xem
      </h3>
      <p className="text-gray-400 mb-8">Bắt đầu xem phim để lưu lại lịch sử</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
      >
        <Play className="w-5 h-5" />
        Khám phá ngay
      </Link>
    </div>
  );
}
