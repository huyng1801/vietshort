'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coins, CheckCircle, Sparkles, Calendar, PartyPopper } from 'lucide-react';
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
      <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-amber-500/20 rounded-full animate-pulse" />
          <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg sm:rounded-xl bg-gray-800/50 animate-pulse" />
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
    <div className="relative bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Success animation overlay */}
      {justCheckedIn && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="text-center animate-in zoom-in-75 duration-500">
            <div className="mb-3 sm:mb-4 animate-bounce flex justify-center">
              <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1.5 sm:mb-2">+{earnedGold} Gold!</p>
            <p className="text-base sm:text-lg text-gray-300">Điểm danh ngày {currentStreak} thành công!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg">Điểm danh hàng ngày</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-400">Chuỗi: <span className="text-amber-400 font-bold">{currentStreak}/7</span> ngày</p>
          </div>
        </div>
        {!checkedToday && (
          <button
            onClick={handleCheckIn}
            disabled={checking}
            className="px-3 py-2 sm:px-4 py-2.5 lg:px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          >
            {checking ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/50 border-t-black rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="hidden xs:inline">Điểm danh</span>
          </button>
        )}
        {checkedToday && (
          <span className="flex items-center gap-1.5 sm:gap-2 text-green-400 text-xs sm:text-sm lg:text-base font-semibold flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Đã điểm danh</span>
          </span>
        )}
      </div>

      {/* 7-day reward grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 lg:gap-3">
        {rewards.map((reward) => {
          const isChecked = reward.day < currentStreak || (reward.day === currentStreak && checkedToday);
          const isCurrent = reward.day === currentStreak + 1 && !checkedToday;
          const isToday = reward.day === currentStreak && checkedToday;
          const isPast = reward.day < (checkedToday ? currentStreak + 1 : currentStreak);

          return (
            <div
              key={reward.id}
              className={cn(
                'relative aspect-square py-1 rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all',
                isChecked || isToday
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : isCurrent
                    ? 'bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/40'
                    : 'bg-gray-800/50 border-white/10',
              )}
            >
              {/* Check mark for completed */}
              {(isChecked || isToday) && (
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" />
                </div>
              )}
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-400 font-medium">Ngày {reward.day}</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Coins className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5', isChecked || isToday ? 'text-amber-400' : 'text-gray-500')} />
                <span className={cn('text-xs sm:text-sm lg:text-base font-bold', isChecked || isToday ? 'text-amber-400' : 'text-gray-500')}>
                  {reward.rewardGold}
                </span>
              </div>
             
            </div>
          );
        })}
      </div>

      {/* Total rewards info */}
      <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base text-gray-500">
        <span>Tổng 7 ngày: <span className="text-amber-400 font-bold">{rewards.reduce((s, r) => s + r.rewardGold, 0)} Gold</span></span>
        <span className="text-[10px] sm:text-xs lg:text-sm">Hết chu kỳ sẽ bắt đầu lại</span>
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
