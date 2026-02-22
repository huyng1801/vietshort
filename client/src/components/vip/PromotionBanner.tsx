'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Gift, Crown, Clock, Sparkles, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

// ─── First Purchase Discount Banner ───────────────────────────

export function FirstPurchaseBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = 'vietshort-first-promo-dismissed';
    if (typeof window !== 'undefined' && localStorage.getItem(key)) {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('vietshort-first-promo-dismissed', '1');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 p-4 sm:p-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-yellow-500 rounded-full blur-2xl" />
      </div>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Gift className="w-6 h-6 text-yellow-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold">Giảm 30% cho lần mua đầu tiên!</div>
          <div className="text-pink-100 text-sm mt-0.5">Nâng cấp VIP ngay để tận hưởng ưu đãi</div>
        </div>
        <Link
          href="/vip"
          className="hidden sm:flex items-center gap-1 px-4 py-2 bg-white text-red-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Xem ngay <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Countdown Promotion Banner ───────────────────────────────

interface CountdownPromoProps {
  title: string;
  endTime: Date;
  discount: number;
  href: string;
}

export function CountdownPromo({ title, endTime, discount, href }: CountdownPromoProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (expired) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Clock className="w-5 h-5 text-orange-400" />
        <span className="font-semibold text-orange-400">{title}</span>
        <span className="ml-auto px-2 py-0.5 bg-red-500 rounded-full text-xs font-bold">-{discount}%</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[
            { val: timeLeft.hours, label: 'giờ' },
            { val: timeLeft.minutes, label: 'phút' },
            { val: timeLeft.seconds, label: 'giây' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-xl font-bold text-white font-mono">
                {String(val).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <Link
          href={href}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-bold text-white hover:from-orange-600 hover:to-red-600 transition-all"
        >
          Mua ngay
        </Link>
      </div>
    </div>
  );
}

// ─── Dynamic Pricing Popup (shows when user views pricing > 30s) ──

export function DynamicPricingPopup() {
  const [show, setShow] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only for non-VIP users
    if (!isAuthenticated || user?.vipTier) return;

    // Check if already dismissed
    const dismissed = localStorage.getItem('vietshort-dynamic-popup-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Show again after 24 hours
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return;
    }

    // Start timer — show after 30 seconds on VIP page
    timerRef.current = setTimeout(() => {
      setShow(true);
    }, 30000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, user]);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('vietshort-dynamic-popup-dismissed', String(Date.now()));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={handleDismiss}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-gray-900 rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Ưu đãi đặc biệt cho bạn!</h3>
          <p className="text-sm text-gray-400 mb-4">
            Giảm <span className="text-amber-400 font-bold">20%</span> khi nâng cấp VIP Gold hôm nay
          </p>
          <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-500 line-through text-sm">49.000đ</span>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <span className="text-xl font-bold text-amber-400">39.200đ</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">VIP Gold 1 tháng</div>
          </div>
          <Link
            href="/vip"
            onClick={handleDismiss}
            className="block w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-xl text-sm font-bold text-black transition-all"
          >
            Nâng cấp ngay
          </Link>
          <button onClick={handleDismiss} className="mt-2 text-xs text-gray-500 hover:text-gray-400">
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VIP Badge ────────────────────────────────────────────────

interface VipBadgeProps {
  vipTier?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VipBadge({ vipTier, size = 'sm', className }: VipBadgeProps) {
  if (!vipTier) return null;

  const isGold = vipTier === 'VIP_GOLD';
  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-bold',
      isGold ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400',
      sizes[size],
      className,
    )}>
      {isGold ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
      {isGold ? 'VIP Gold' : 'VIP FreeAds'}
    </span>
  );
}
