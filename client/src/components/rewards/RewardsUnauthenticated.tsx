import { Gift } from 'lucide-react';
import Link from 'next/link';

export function RewardsUnauthenticated() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="text-center max-w-md mx-auto">
        <Gift className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-amber-500 mx-auto mb-4 sm:mb-6" />
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
          Đăng nhập để nhận thưởng
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-6 sm:mb-8 px-2">
          Điểm danh hàng ngày, hoàn thành nhiệm vụ, nhận Gold miễn phí!
        </p>
        <Link
          href="/login"
          className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all shadow-lg shadow-orange-500/50"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
