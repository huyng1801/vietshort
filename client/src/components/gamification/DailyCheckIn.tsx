'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coins, CheckCircle, Gift, Sparkles, Calendar } from 'lucide-react';
import { checkInApi } from '@/lib/api';
import type { CheckInStatus, CheckInRecord } from '@/types/gamification';
import { cn } from '@/lib/utils';

// ─── Check-in Calendar ──────────────────────────────────────
interface DailyCheckInProps {
  onGoldEarned?: (amount: number) => void;
}

interface CheckInReward {
  id: string;
  day: number;
  rewardGold: number;
  description?: string;
}

export function DailyCheckIn({ onGoldEarned }: DailyCheckInProps) {
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [rewards, setRewards] = useState<CheckInReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [earnedGold, setEarnedGold] = useState(0);

  useEffect(() => {
    Promise.all([
      checkInApi.getStatus().catch(() => null),
      checkInApi.getHistory().catch(() => []),
      checkInApi.getRewards().catch(() => []),
    ]).then(([s, h, r]) => {
      if (s) setStatus(s);
      if (h) setHistory(h);
      if (r && r.length > 0) {
        setRewards(r);
      } else {
        // Fallback to default if no rewards in DB
        setRewards([
          { id: '1', day: 1, rewardGold: 5, description: 'Ngày 1' },
          { id: '2', day: 2, rewardGold: 5, description: 'Ngày 2' },
          { id: '3', day: 3, rewardGold: 10, description: 'Ngày 3' },
          { id: '4', day: 4, rewardGold: 10, description: 'Ngày 4' },
          { id: '5', day: 5, rewardGold: 15, description: 'Ngày 5' },
          { id: '6', day: 6, rewardGold: 15, description: 'Ngày 6' },
          { id: '7', day: 7, rewardGold: 30, description: 'Tuần hoàn thành!' },
        ]);
      }
      setLoading(false);
    });
  }, []);

  const handleCheckIn = useCallback(async () => {
    if (checking || status?.checkedInToday) return;
    setChecking(true);
    try {
      const result = await checkInApi.checkIn();
      if (result.success && result.goldReward) {
        setEarnedGold(result.goldReward);
        setJustCheckedIn(true);
        setStatus((prev) => prev ? { ...prev, checkedInToday: true, currentStreak: result.day ?? prev.currentStreak } : prev);
        onGoldEarned?.(result.goldReward);
        // Auto-hide animation after 3s
        setTimeout(() => setJustCheckedIn(false), 3000);
      }
    } catch {
      // silently fail
    } finally {
      setChecking(false);
    }
  }, [checking, status, onGoldEarned]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-full animate-pulse" />
          <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-gray-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const currentStreak = status?.currentStreak ?? 0;
  const checkedToday = status?.checkedInToday ?? false;

  // Build checked days set from history
  const checkedDaysSet = new Set(history.map((h) => h.day));

  return (
    <div className="relative bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-8 lg:p-10 overflow-hidden">
      {/* Success animation overlay */}
      {justCheckedIn && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="text-center animate-in zoom-in-75 duration-500">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <p className="text-3xl font-bold text-amber-400 mb-2">+{earnedGold} Gold!</p>
            <p className="text-lg text-gray-300">Điểm danh ngày {currentStreak} thành công!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Điểm danh hàng ngày</h3>
            <p className="text-base text-gray-400">Chuỗi: <span className="text-amber-400 font-bold">{currentStreak}/7</span> ngày</p>
          </div>
        </div>
        {!checkedToday && (
          <button
            onClick={handleCheckIn}
            disabled={checking}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {checking ? (
              <div className="w-5 h-5 border-2 border-black/50 border-t-black rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Điểm danh
          </button>
        )}
        {checkedToday && (
          <span className="flex items-center gap-2 text-green-400 text-base font-semibold">
            <CheckCircle className="w-5 h-5" /> Đã điểm danh
          </span>
        )}
      </div>

      {/* 7-day reward grid */}
      <div className="grid grid-cols-7 gap-3 lg:gap-4">
        {rewards.map((reward) => {
          const isChecked = reward.day < currentStreak || (reward.day === currentStreak && checkedToday);
          const isCurrent = reward.day === currentStreak + 1 && !checkedToday;
          const isToday = reward.day === currentStreak && checkedToday;
          const isPast = reward.day < (checkedToday ? currentStreak + 1 : currentStreak);

          return (
            <div
              key={reward.id}
              className={cn(
                'relative aspect-square py-1 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all',
                isChecked || isToday
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : isCurrent
                    ? 'bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/40'
                    : 'bg-gray-800/50 border-white/10',
              )}
            >
              {/* Check mark for completed */}
              {(isChecked || isToday) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <span className="text-sm text-gray-400 font-medium">Ngày {reward.day}</span>
              <div className="flex items-center gap-1">
                <Coins className={cn('w-5 h-5', isChecked || isToday ? 'text-amber-400' : 'text-gray-500')} />
                <span className={cn('text-base font-bold', isChecked || isToday ? 'text-amber-400' : 'text-gray-500')}>
                  {reward.rewardGold}
                </span>
              </div>
             
            </div>
          );
        })}
      </div>

      {/* Total rewards info */}
      <div className="mt-5 flex items-center justify-between text-base text-gray-500">
        <span>Tổng 7 ngày: <span className="text-amber-400 font-bold">{rewards.reduce((s, r) => s + r.rewardGold, 0)} Gold</span></span>
        <span>Hết chu kỳ sẽ bắt đầu lại</span>
      </div>
    </div>
  );
}

// ─── Compact Check-in Button (for header/nav) ───────────────
export function CheckInButton() {
  const [status, setStatus] = useState<CheckInStatus | null>(null);

  useEffect(() => {
    checkInApi.getStatus().then(setStatus).catch(() => {});
  }, []);

  if (!status) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
        status.checkedInToday
          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse',
      )}
    >
      <Calendar className="w-3 h-3" />
      {status.checkedInToday ? `${status.currentStreak}/7` : 'Điểm danh'}
    </div>
  );
}
