import { Sparkles, Coins } from 'lucide-react';
import { VipBadge } from '@/components/vip';

interface RewardsHeaderProps {
  user: { goldBalance?: number; vipTier?: string } | null;
  goldEarned: number;
}

export function RewardsHeader({ user, goldEarned }: RewardsHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-orange-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Phần thưởng</h1>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-400">
            Điểm danh mỗi ngày, hoàn thành nhiệm vụ để kiếm Gold!
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 sm:flex-col sm:items-end">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-400">
              {user?.goldBalance ?? 0}
            </span>
          </div>
          {user?.vipTier && <VipBadge vipTier={user.vipTier} size="sm" />}
        </div>
      </div>

      {goldEarned > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-amber-500/20 flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm lg:text-base text-gray-400">Hôm nay đã kiếm:</span>
          <span className="text-base sm:text-lg lg:text-xl font-bold text-green-400">
            +{goldEarned} Gold
          </span>
        </div>
      )}
    </div>
  );
}
