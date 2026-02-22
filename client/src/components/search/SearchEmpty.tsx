import { Search, Film } from 'lucide-react';

interface SearchEmptyProps {
  isCategoryBrowse: boolean;
  onGoHome: () => void;
}

export function SearchEmpty({ isCategoryBrowse, onGoHome }: SearchEmptyProps) {
  return (
    <div className="text-center py-20">
      {isCategoryBrowse ? (
        <Film className="w-12 h-12 text-gray-700 mx-auto mb-4" />
      ) : (
        <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
      )}
      <h2 className="text-base sm:text-lg font-bold text-white mb-2">Không tìm thấy kết quả</h2>
      <p className="text-gray-500 text-xs sm:text-sm mb-6">
        Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
      </p>
      <button
        onClick={onGoHome}
        className="px-5 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
      >
        Về trang chủ
      </button>
    </div>
  );
}
