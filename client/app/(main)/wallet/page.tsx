'use client';

import { useState, useEffect } from 'react';
import { Coins, History, Plus, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { walletApi } from '@/lib/api';
import { GoldBalanceCard, TransactionHistory } from '@/components/payment/WalletComponents';
import { GoldTopUp } from '@/components/payment/GoldTopUp';
import { cn } from '@/lib/utils';
import { Breadcrumb } from '@/components/common/Breadcrumb';

type Tab = 'topup' | 'history';

export default function WalletPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const _hasHydrated = useHasHydrated();
  const [activeTab, setActiveTab] = useState<Tab>('topup');
  const [balance, setBalance] = useState<number>(user?.goldBalance ?? 0);
  const [vipTier, setVipTier] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return;
    walletApi.getBalance().then((res) => {
      setBalance(res.goldBalance);
      setVipTier(res.vipTier);
    }).catch(() => {});
  }, [_hasHydrated, isAuthenticated]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 lg:px-6">
        <div className="text-center">
          <Coins className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-amber-500 mx-auto mb-4 sm:mb-5 lg:mb-6" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">Đăng nhập để xem ví</h2>
          <p className="text-gray-400 text-xs sm:text-sm lg:text-base mb-5 sm:mb-6 lg:mb-8">Quản lý Gold và lịch sử giao dịch</p>
          <Link href="/login" className="px-6 sm:px-8 py-3 sm:py-4 bg-red-500 hover:bg-red-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'topup' as Tab, label: 'Nạp Gold', icon: Plus },
    { key: 'history' as Tab, label: 'Lịch sử', icon: History },
  ];

  return (
    <div className="min-h-screen pb-20 lg:pb-8 bg-[#0a0a0a]">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-20 lg:pt-24">
        <Breadcrumb items={[{ label: 'V\u00ed c\u1ee7a t\u00f4i' }]} />
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 sm:mb-5 lg:mb-6">Ví của tôi</h1>

        {/* Balance Card */}
        <GoldBalanceCard
          balance={balance}
          vipTier={vipTier}
          onTopUp={() => setActiveTab('topup')}
        />

        {/* Quick actions */}
        <div className="flex gap-4 mt-6">
          <Link
            href="/vip"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl text-base font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Crown className="w-5 h-5" /> Mua VIP
          </Link>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1.5 sm:gap-2 mt-5 sm:mt-6 lg:mt-8 bg-gray-800/50 rounded-lg sm:rounded-xl p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 lg:py-4 rounded-md sm:rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-all',
                  isActive ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white',
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="mt-5 sm:mt-6 lg:mt-8">
          {activeTab === 'topup' && <GoldTopUp />}
          {activeTab === 'history' && <TransactionHistory />}
        </div>
      </div>
    </div>
  );
}
