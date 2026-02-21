'use client';

import { useState, useCallback } from 'react';
import {
  Gift, Calendar, Zap, Trophy, Crown, Coins,
  Play, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { DailyCheckIn } from '@/components/gamification/DailyCheckIn';
import { DailyQuests, WatchAdButton } from '@/components/gamification/DailyQuests';
import { AchievementsPanel } from '@/components/gamification/Achievements';
import {
  ComebackBanner,
  BehaviorOffer,
  NotificationPermissionBanner,
} from '@/components/gamification/RetentionWidgets';
import { VipBadge } from '@/components/payment/PromotionBanner';
import { cn } from '@/lib/utils';
import { Breadcrumb } from '@/components/common/Breadcrumb';

type Tab = 'checkin' | 'quests' | 'achievements';

export default function RewardsPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const _hasHydrated = useHasHydrated();
  const [activeTab, setActiveTab] = useState<Tab>('checkin');
  const [goldEarned, setGoldEarned] = useState(0);

  const handleGoldEarned = useCallback(
    (amount: number) => {
      setGoldEarned((prev) => prev + amount);
      // Update local user state
      if (user) {
        updateUser({ goldBalance: (user.goldBalance || 0) + amount });
      }
    },
    [user, updateUser],
  );

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Gift className="w-8 h-8 text-amber-500 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="text-center max-w-md mx-auto">
          <Gift className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-amber-500 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">Đăng nhập để nhận thưởng</h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-6 sm:mb-8 px-2">Điểm danh hàng ngày, hoàn thành nhiệm vụ, nhận Gold miễn phí!</p>
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

  const tabs = [
    { key: 'checkin' as Tab, label: 'Điểm danh', icon: Calendar },
    { key: 'quests' as Tab, label: 'Nhiệm vụ', icon: Zap },
    { key: 'achievements' as Tab, label: 'Thành tích', icon: Trophy },
  ];

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-20 lg:pt-24">

        <Breadcrumb items={[{ label: 'Ph\u1ea7n th\u01b0\u1edfng' }]} />

        {/* Header Card */}
        <div className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 overflow-hidden">
          {/* Decorative elements */}
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
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-400">{user?.goldBalance ?? 0}</span>
              </div>
              {user?.vipTier && (
                <VipBadge vipTier={user.vipTier} size="sm" />
              )}
            </div>
          </div>

          {/* Session earnings */}
          {goldEarned > 0 && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-amber-500/20 flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm lg:text-base text-gray-400">Hôm nay đã kiếm:</span>
              <span className="text-base sm:text-lg lg:text-xl font-bold text-green-400">+{goldEarned} Gold</span>
            </div>
          )}
        </div>

        {/* Smart retention banners */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 lg:mb-6">
          <NotificationPermissionBanner />
          <ComebackBanner />
          <BehaviorOffer />
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1.5 sm:gap-2 bg-gray-800/50 rounded-lg sm:rounded-xl p-1.5 sm:p-2 mb-4 sm:mb-5 lg:mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 lg:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all',
                  isActive ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'checkin' && (
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <DailyCheckIn onGoldEarned={handleGoldEarned} />

              {/* Watch Ad Section */}
              <div>
                <WatchAdButton onReward={handleGoldEarned} className="w-full" />
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center px-2">
                  Xem quảng cáo ngắn để nhận Gold x2. Giới hạn thời gian chờ 30 giây.
                </p>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Link
                  href="/wallet"
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 bg-gray-800/50 border border-white/10 rounded-lg sm:rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Coins className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base text-white font-semibold">Ví Gold</p>
                    <p className="text-xs sm:text-sm text-gray-500">Nạp & quản lý</p>
                  </div>
                </Link>
                <Link
                  href="/vip"
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 bg-gray-800/50 border border-white/10 rounded-lg sm:rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base text-white font-semibold">VIP</p>
                    <p className="text-xs sm:text-sm text-gray-500">Nâng cấp</p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <DailyQuests onGoldEarned={handleGoldEarned} />
          )}

          {activeTab === 'achievements' && (
            <AchievementsPanel />
          )}
        </div>

        {/* Info footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500 px-4">
            Phần thưởng được cập nhật mỗi ngày lúc 00:00. Gold nhận được sẽ tự động cộng vào ví.
          </p>
        </div>
      </div>
    </div>
  );
}
