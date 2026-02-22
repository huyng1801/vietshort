'use client';

import { useState, useCallback } from 'react';
import { Coins, Crown, Gift } from 'lucide-react';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import {
  DailyCheckIn, DailyQuests, WatchAdButton, AchievementsPanel,
  ComebackBanner, BehaviorOffer, NotificationPermissionBanner,
  RewardsHeader, RewardsTabs,  RewardsUnauthenticated,
} from '@/components/rewards';
import type { RewardsTab } from '@/components/rewards';
import { Breadcrumb } from '@/components/common';
import Link from 'next/link';

type Tab = RewardsTab;

export default function RewardsPage() {
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
    return <RewardsUnauthenticated />;
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-20 lg:pt-24">

        <Breadcrumb items={[{ label: 'Ph\u1ea7n th\u01b0\u1edfng' }]} />

        {/* Header Card */}
        <RewardsHeader
          user={user ? { goldBalance: user.goldBalance ?? undefined, vipTier: user.vipTier ?? undefined } : null}
          goldEarned={goldEarned}
        />

        {/* Smart retention banners */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 lg:mb-6">
          <NotificationPermissionBanner />
          <ComebackBanner />
          <BehaviorOffer />
        </div>

        {/* Tab navigation */}
        <RewardsTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
