'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lock, Coins, Crown, Eye, Loader2, X, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { unlockApi, walletApi, type AccessCheck } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UnlockModalProps {
  episodeId: string;
  episodeNumber: number;
  videoTitle?: string;
  onUnlocked: () => void;
  onClose: () => void;
}

export function UnlockModal({ episodeId, episodeNumber, videoTitle, onUnlocked, onClose }: UnlockModalProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [accessInfo, setAccessInfo] = useState<AccessCheck | null>(null);
  const [balance, setBalance] = useState<number>(user?.goldBalance ?? 0);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      setLoading(true);
      try {
        const [accessRes, balanceRes] = await Promise.allSettled([
          unlockApi.checkAccess(episodeId),
          isAuthenticated ? walletApi.getBalance() : Promise.resolve(null),
        ]);

        if (accessRes.status === 'fulfilled') {
          setAccessInfo(accessRes.value);
          if (accessRes.value.hasAccess) {
            onUnlocked();
            return;
          }
        }
        if (balanceRes.status === 'fulfilled' && balanceRes.value) {
          setBalance(balanceRes.value.goldBalance);
        }
      } catch {
        setError('Không thể kiểm tra quyền truy cập');
      } finally {
        setLoading(false);
      }
    };
    checkAccess();
  }, [episodeId, isAuthenticated, onUnlocked]);

  const handleUnlockWithGold = async () => {
    if (!isAuthenticated) return;
    setUnlocking(true);
    setError(null);
    try {
      const res = await unlockApi.unlockWithGold(episodeId);
      if (res.success) {
        setSuccess(true);
        // Update local balance
        setBalance((prev) => prev - (res.goldSpent || 0));
        // Update global store
        useAuthStore.getState().updateUser({
          goldBalance: balance - (res.goldSpent || 0),
        });
        setTimeout(() => onUnlocked(), 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Mở khóa thất bại');
    } finally {
      setUnlocking(false);
    }
  };

  const price = accessInfo?.unlockPrice ?? 5;
  const hasEnough = balance >= price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xs sm:max-w-sm md:max-w-md bg-gray-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-1 sm:h-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 sm:p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
        </button>

        <div className="p-4 sm:p-5 md:p-6">
          {loading ? (
            <div className="flex flex-col items-center py-6 sm:py-8">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-amber-500 mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm text-gray-400">Đang kiểm tra...</span>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3 sm:mb-4 animate-like-bounce">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">Mở khóa thành công!</h3>
              <p className="text-xs sm:text-sm text-gray-400">Đang tải tập phim...</p>
            </div>
          ) : (
            <>
              {/* Lock icon */}
              <div className="flex flex-col items-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-2 sm:mb-3">
                  <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white text-center">
                  Mở khóa Tập {episodeNumber}
                </h3>
                {videoTitle && (
                  <p className="text-xs sm:text-sm text-gray-400 text-center mt-1 line-clamp-2">{videoTitle}</p>
                )}
              </div>

              {!isAuthenticated ? (
                /* Not logged in */
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm text-gray-400 text-center">
                    Đăng nhập để mở khóa tập phim này
                  </p>
                  <Link
                    href="/login"
                    className="block w-full py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 rounded-lg sm:rounded-xl text-center text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Unlock with Gold */}
                  <div className="rounded-lg sm:rounded-xl border border-gray-700 p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                        <span className="font-semibold text-white text-xs sm:text-sm truncate">Mở khóa bằng Gold</span>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-amber-400">{price} Gold</span>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm mb-2 sm:mb-3">
                      <span className="text-gray-400">Số dư:</span>
                      <span className={cn('font-medium', hasEnough ? 'text-green-400' : 'text-red-400')}>
                        {balance.toLocaleString('vi-VN')} Gold
                      </span>
                    </div>

                    {hasEnough ? (
                      <button
                        onClick={handleUnlockWithGold}
                        disabled={unlocking}
                        className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {unlocking ? (
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                        Mở khóa ngay
                      </button>
                    ) : (
                      <div className="space-y-1.5 sm:space-y-2">
                        <p className="text-xs text-red-400 text-center">
                          Cần thêm {price - balance} Gold
                        </p>
                        <Link
                          href="/wallet"
                          className="block w-full py-2.5 sm:py-3 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg sm:rounded-xl text-center text-xs sm:text-sm font-semibold text-amber-400 transition-colors"
                        >
                          Nạp thêm Gold
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* VIP Option */}
                  <Link
                    href="/vip"
                    className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border border-gray-700 p-3 sm:p-4 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-white">Nâng cấp VIP</div>
                      <div className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1">Xem thêm không giới hạn</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                  </Link>

                  {error && (
                    <p className="text-xs text-red-400 text-center">{error}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Compact lock badge for episode lists ─────────────────────

interface EpisodeLockBadgeProps {
  unlockPrice?: number | null;
  isVipOnly?: boolean;
  hasAccess?: boolean;
}

export function EpisodeLockBadge({ unlockPrice, isVipOnly, hasAccess }: EpisodeLockBadgeProps) {
  if (hasAccess || (!unlockPrice && !isVipOnly)) return null;

  if (isVipOnly) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 rounded text-[10px] text-amber-400 font-medium">
        <Crown className="w-2.5 h-2.5" /> VIP
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 rounded text-[10px] text-yellow-400 font-medium">
      <Coins className="w-2.5 h-2.5" /> {unlockPrice}
    </span>
  );
}
