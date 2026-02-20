'use client';

import { useState, useCallback } from 'react';
import {
  Gift, Calendar, Zap, Trophy, Crown, Coins,
  Play, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Gift className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3">Đăng nhập để nhận thưởng</h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-400 mb-8">Điểm danh hàng ngày, hoàn thành nhiệm vụ, nhận Gold miễn phí!</p>
          <Link
            href="/login"
            className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-xl text-base font-semibold transition-colors"
          >
            Đăng nhập
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
      <div className="max-w-4xl mx-auto px-4 pt-20 lg:pt-24">

        <Breadcrumb items={[{ label: 'Ph\u1ea7n th\u01b0\u1edfng' }]} />

        {/* Header Card */}
        <div className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-400" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Phần thưởng</h1>
              </div>
              <p className="text-xs sm:text-sm lg:text-base text-gray-400">
                Điểm danh mỗi ngày, hoàn thành nhiệm vụ để kiếm Gold!
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-amber-400" />
                <span className="text-base sm:text-lg lg:text-xl font-bold text-amber-400">{user?.goldBalance ?? 0}</span>
              </div>
              {user?.vipTier && (
                <VipBadge vipTier={user.vipTier} size="sm" />
              )}
            </div>
          </div>

          {/* Session earnings */}
          {goldEarned > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center gap-3">
              <span className="text-base text-gray-400">Hôm nay đã kiếm:</span>
              <span className="text-lg font-bold text-green-400">+{goldEarned} Gold</span>
            </div>
          )}
        </div>

        {/* Smart retention banners */}
        <div className="space-y-3 mb-6">
          <NotificationPermissionBanner />
          <ComebackBanner />
          <BehaviorOffer />
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 bg-gray-800/50 rounded-xl p-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white',
                )}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'checkin' && (
            <div className="space-y-6">
              <DailyCheckIn onGoldEarned={handleGoldEarned} />

              {/* Watch Ad Section */}
              <div>
                <WatchAdButton onReward={handleGoldEarned} className="w-full" />
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Xem quảng cáo ngắn để nhận Gold x2. Giới hạn thời gian chờ 30 giây.
                </p>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/wallet"
                  className="flex items-center gap-3 p-5 bg-gray-800/50 border border-white/10 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Coins className="w-7 h-7 text-amber-400" />
                  <div>
                    <p className="text-base text-white font-semibold">Ví Gold</p>
                    <p className="text-sm text-gray-500">Nạp & quản lý</p>
                  </div>
                </Link>
                <Link
                  href="/vip"
                  className="flex items-center gap-3 p-5 bg-gray-800/50 border border-white/10 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Crown className="w-7 h-7 text-amber-400" />
                  <div>
                    <p className="text-base text-white font-semibold">VIP</p>
                    <p className="text-sm text-gray-500">Nâng cấp</p>
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
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Phần thưởng được cập nhật mỗi ngày lúc 00:00. Gold nhận được sẽ tự động cộng vào ví.
          </p>
        </div>
      </div>
    </div>
  );
}
