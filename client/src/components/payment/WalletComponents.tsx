'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coins, ArrowUpRight, ArrowDownRight, Clock, Filter, ChevronDown, Loader2, Wallet } from 'lucide-react';
import { paymentApi, walletApi, type Transaction } from '@/lib/api';
import { formatVNDFull } from './VipPlans';
import { cn } from '@/lib/utils';

// ─── Gold Balance Card ────────────────────────────────────────

interface GoldBalanceProps {
  balance: number;
  vipTier?: string | null;
  onTopUp?: () => void;
}

export function GoldBalanceCard({ balance, vipTier, onTopUp }: GoldBalanceProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 p-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-4 border-white" />
        <div className="absolute bottom-2 left-8 w-16 h-16 rounded-full border-4 border-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-200" />
            <span className="text-amber-100 text-sm font-medium">Ví Gold</span>
          </div>
          {vipTier && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-bold',
              vipTier === 'VIP_GOLD' ? 'bg-amber-900/50 text-amber-200' : 'bg-blue-900/50 text-blue-200',
            )}>
              {vipTier === 'VIP_GOLD' ? '👑 VIP Gold' : '⚡ VIP FreeAds'}
            </span>
          )}
        </div>

        <div className="flex items-end gap-2 mb-1">
          <Coins className="w-8 h-8 text-yellow-300" />
          <span className="text-4xl font-bold text-white tracking-tight">
            {balance.toLocaleString('vi-VN')}
          </span>
        </div>
        <p className="text-amber-200/70 text-sm">Gold hiện có</p>

        {onTopUp && (
          <button
            onClick={onTopUp}
            className="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-sm font-semibold text-white transition-colors"
          >
            + Nạp Gold
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Transaction History ──────────────────────────────────────

interface TransactionHistoryProps {
  className?: string;
}

export function TransactionHistory({ className }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchTransactions = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const res = await paymentApi.history(pageNum, 20);
      const items = res?.data || [];
      setTransactions((prev) => (append ? [...prev, ...items] : items));
      setHasMore(items.length >= 20);
    } catch {
      /* silent fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchTransactions(next, true);
  };

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => {
      if (filter === 'income') return (t.rewardValue ?? 0) > 0;
      if (filter === 'expense') return (t.rewardValue ?? 0) < 0;
      return t.status === filter;
    });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'income', label: 'Thu' },
          { key: 'expense', label: 'Chi' },
          { key: 'PENDING', label: 'Đang xử lý' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              filter === f.key
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-gray-800 text-gray-400 hover:text-white',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {loading && transactions.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Chưa có giao dịch nào
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && filtered.length > 0 && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-white bg-gray-800/50 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
          Xem thêm
        </button>
      )}
    </div>
  );
}

function TransactionRow({ transaction: t }: { transaction: Transaction }) {
  const isPositive = (t.rewardValue ?? 0) > 0;
  const typeLabels: Record<string, string> = {
    BUY_GOLD: 'Nạp Gold',
    SPEND_GOLD: 'Chi Gold',
    PURCHASE_VIP: 'Mua VIP',
    UNLOCK_EPISODE: 'Mở khóa tập phim',
    ADMIN_ADJUST: 'Điều chỉnh',
    CHECKIN_REWARD: 'Điểm danh',
    DAILY_TASK_REWARD: 'Nhiệm vụ',
    AD_REWARD: 'Xem quảng cáo',
    REFUND: 'Hoàn tiền',
    CTV_COMMISSION: 'Hoa hồng CTV',
  };
  const statusLabels: Record<string, { text: string; color: string }> = {
    PENDING: { text: 'Đang xử lý', color: 'text-yellow-400' },
    COMPLETED: { text: 'Thành công', color: 'text-green-400' },
    FAILED: { text: 'Thất bại', color: 'text-red-400' },
    REFUNDED: { text: 'Đã hoàn', color: 'text-blue-400' },
  };

  const status = statusLabels[t.status] || { text: t.status, color: 'text-gray-400' };
  const date = new Date(t.createdAt);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/60 transition-colors">
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center',
        isPositive ? 'bg-green-500/10' : 'bg-red-500/10',
      )}>
        {isPositive ? (
          <ArrowDownRight className="w-5 h-5 text-green-400" />
        ) : (
          <ArrowUpRight className="w-5 h-5 text-red-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {t.description || typeLabels[t.type] || t.type}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span>{date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className={status.color}>• {status.text}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        {t.rewardValue !== null && t.rewardValue !== 0 && (
          <div className={cn('text-sm font-bold', isPositive ? 'text-green-400' : 'text-red-400')}>
            {isPositive ? '+' : ''}{t.rewardValue} <Coins className="w-3 h-3 inline" />
          </div>
        )}
        {t.amount > 0 && (
          <div className="text-xs text-gray-500">{formatVNDFull(t.amount)}</div>
        )}
      </div>
    </div>
  );
}
