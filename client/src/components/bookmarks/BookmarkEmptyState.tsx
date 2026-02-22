import { Bookmark, Play } from 'lucide-react';
import Link from 'next/link';

interface BookmarkEmptyStateProps {
  searchQuery: string;
}

export function BookmarkEmptyState({ searchQuery }: BookmarkEmptyStateProps) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <Bookmark className="w-10 h-10 text-gray-600" />
      </div>
      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3">
        {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có phim được đánh dấu'}
      </h3>
      <p className="text-gray-400 mb-8">
        {searchQuery
          ? 'Thử thay đổi từ khóa tìm kiếm'
          : 'Nhấn biểu tượng đánh dấu khi xem phim để lưu vào đây'}
      </p>
      {!searchQuery && (
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
        >
          <Play className="w-5 h-5" />
          Khám phá ngay
        </Link>
      )}
    </div>
  );
}
