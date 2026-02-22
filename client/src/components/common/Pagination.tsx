interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-4 py-8">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-colors"
      >
        Trước
      </button>
      <span className="text-gray-400">
        Trang {page} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-colors"
      >
        Sau
      </button>
    </div>
  );
}
