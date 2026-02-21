'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Gift, Clock, X, Zap, ChevronRight, Crown, Film, Coins, Flame, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// ─── Comeback Reminder Banner ───────────────────────────────
// Shows when user hasn't watched for a while (tracked via localStorage)
export function ComebackBanner() {
  const [show, setShow] = useState(false);
  const [daysSinceWatch, setDaysSinceWatch] = useState(0);

  useEffect(() => {
    const lastWatch = localStorage.getItem('vs_last_watch');
    if (!lastWatch) return;
    const days = Math.floor((Date.now() - parseInt(lastWatch)) / 86400000);
    if (days >= 1) {
      setDaysSinceWatch(days);
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
      <button onClick={() => setShow(false)} className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-gray-500 hover:text-white">
        <X className="w-3.5 h-3.5 sm:w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
        <div className="w-8 h-8 sm:w-9 h-9 lg:w-10 lg:h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Film className="w-4 h-4 sm:w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-white font-semibold">Bạn đã vắng {daysSinceWatch} ngày!</p>
          <p className="text-[10px] sm:text-xs text-gray-400">Nhiều phim mới đang chờ bạn. Quay lại xem ngay!</p>
        </div>
        <Link
          href="/"
          className="px-2.5 py-1.5 sm:px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs font-semibold rounded-md sm:rounded-lg transition-colors flex-shrink-0"
        >
          Xem ngay
        </Link>
      </div>
    </div>
  );
}

// ─── Streak Reminder ────────────────────────────────────────
// Reminds user about their check-in streak
interface StreakReminderProps {
  currentStreak: number;
}

export function StreakReminder({ currentStreak }: StreakReminderProps) {
  if (currentStreak < 2) return null;

  const messages = [
    { min: 2, max: 3, text: 'Chuỗi đang tốt!', sub: 'Tiếp tục điểm danh để nhận thêm Gold.', color: 'amber' },
    { min: 4, max: 5, text: `${currentStreak} ngày liên tục!`, sub: 'Sắp hoàn thành chu kỳ 7 ngày rồi!', color: 'orange' },
    { min: 6, max: 7, text: 'Sắp đạt đỉnh!', sub: 'Chỉ còn 1 ngày nữa là nhận 30 Gold bonus!', color: 'red' },
  ];

  const msg = messages.find((m) => currentStreak >= m.min && currentStreak <= m.max) || messages[0];

  return (
    <div className={cn(
      'flex items-center gap-2 sm:gap-2.5 lg:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border',
      `bg-${msg.color}-500/5 border-${msg.color}-500/20`,
    )}>
      <div className="text-xl sm:text-2xl"><Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" /></div>
      <div>
        <p className={cn('text-xs sm:text-sm font-bold', `text-${msg.color}-400`)}>{msg.text}</p>
        <p className="text-[10px] sm:text-xs text-gray-400">{msg.sub}</p>
      </div>
    </div>
  );
}

// ─── Behavior-based Offer ───────────────────────────────────
// Shows personalized offer based on viewing behavior
export function BehaviorOffer() {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);
  const [offerType, setOfferType] = useState<'vip_upsell' | 'gold_offer' | 'binge_reward'>('vip_upsell');

  useEffect(() => {
    // Only show for non-VIP users
    if (user?.vipTier) return;

    // Check last dismissed
    const lastDismissed = localStorage.getItem('vs_behavior_offer_dismissed');
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000) return;

    // Determine offer type based on viewing patterns
    const watchCount = parseInt(localStorage.getItem('vs_watch_count') || '0');
    if (watchCount >= 10) {
      setOfferType('binge_reward');
      setShow(true);
    } else if (watchCount >= 5) {
      setOfferType('gold_offer');
      setShow(true);
    } else if (watchCount >= 3) {
      setOfferType('vip_upsell');
      setShow(true);
    }
  }, [user]);

  const dismiss = () => {
    localStorage.setItem('vs_behavior_offer_dismissed', String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  const offers = {
    vip_upsell: {
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      bg: 'from-amber-500/10 to-yellow-500/10',
      border: 'border-amber-500/20',
      title: 'Nâng cấp VIP!',
      description: 'Xem không giới hạn, không quảng cáo. Tiết kiệm đến 22%!',
      cta: 'Xem gói VIP',
      href: '/vip',
    },
    gold_offer: {
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      bg: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/20',
      title: 'Nạp Gold ưu đãi!',
      description: 'Bạn đang xem nhiều phim. Nạp Gold để mở khóa nhanh hơn!',
      cta: 'Nạp ngay',
      href: '/wallet',
    },
    binge_reward: {
      icon: <Gift className="w-5 h-5 text-purple-400" />,
      bg: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-500/20',
      title: 'Fan cứng!',
      description: 'Bạn đã xem 10+ tập! Nhận ưu đãi VIP Gold -20%.',
      cta: 'Nhận ưu đãi',
      href: '/vip',
    },
  };

  const offer = offers[offerType];

  return (
    <div className={cn('relative rounded-lg sm:rounded-xl border p-3 sm:p-4 bg-gradient-to-r', offer.bg, offer.border)}>
      <button onClick={dismiss} className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-gray-500 hover:text-white">
        <X className="w-3.5 h-3.5 sm:w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
        <div className="w-8 h-8 sm:w-9 h-9 lg:w-10 lg:h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
          {offer.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-white font-bold">{offer.title}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{offer.description}</p>
        </div>
        <Link
          href={offer.href}
          className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-colors flex-shrink-0 mr-4"
        >
          {offer.cta} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Countdown Pressure Timer ───────────────────────────────
// Shows a 2-minute limited-time offer with urgency
interface CountdownPressureProps {
  offerText: string;
  discountPercent: number;
  targetHref: string;
  durationSeconds?: number;
  onExpired?: () => void;
}

export function CountdownPressure({
  offerText,
  discountPercent,
  targetHref,
  durationSeconds = 120,
  onExpired,
}: CountdownPressureProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      setExpired(true);
      onExpired?.();
      return;
    }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining, onExpired]);

  if (expired) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 30;

  return (
    <div
      className={cn(
        'relative rounded-lg sm:rounded-xl border p-3 sm:p-4 bg-gradient-to-r overflow-hidden transition-all',
        isUrgent
          ? 'from-red-500/10 to-orange-500/10 border-red-500/30 animate-pulse'
          : 'from-amber-500/10 to-orange-500/10 border-amber-500/30',
      )}
    >
      {/* Timer stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-700">
        <div
          className={cn('h-full transition-all', isUrgent ? 'bg-red-500' : 'bg-amber-500')}
          style={{ width: `${(remaining / durationSeconds) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
        <div className={cn(
          'w-10 h-10 sm:w-11 h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-mono text-xs sm:text-sm font-bold flex-shrink-0 border',
          isUrgent
            ? 'bg-red-500/20 border-red-500/40 text-red-400'
            : 'bg-amber-500/20 border-amber-500/40 text-amber-400',
        )}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
            <Zap className={cn('w-3 h-3 sm:w-3.5 h-3.5', isUrgent ? 'text-red-400' : 'text-amber-400')} />
            <span className="text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-wider">Ưu đãi giới hạn!</span>
          </div>
          <p className="text-xs sm:text-sm text-white font-semibold truncate">{offerText}</p>
        </div>
        <Link
          href={targetHref}
          className={cn(
            'px-3 py-1.5 sm:px-4 py-2 text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-colors flex-shrink-0',
            isUrgent
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-black',
          )}
        >
          -{discountPercent}% Ngay!
        </Link>
      </div>
    </div>
  );
}

// ─── Watch Tracker (utility - records watch activity) ──────
/** Call this when user watches an episode to update localStorage stats */
export function recordWatchActivity() {
  try {
    localStorage.setItem('vs_last_watch', String(Date.now()));
    const count = parseInt(localStorage.getItem('vs_watch_count') || '0');
    localStorage.setItem('vs_watch_count', String(count + 1));
  } catch {}
}

// ─── Notification Permission Request ────────────────────────
export function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      const dismissed = localStorage.getItem('vs_notif_dismissed');
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShow(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setShow(false);
      if (result === 'denied') {
        localStorage.setItem('vs_notif_dismissed', String(Date.now()));
      }
    } catch {
      setShow(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem('vs_notif_dismissed', String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
        <div className="w-8 h-8 sm:w-9 h-9 lg:w-10 lg:h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 sm:w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-white font-semibold">Bật thông báo!</p>
          <p className="text-[10px] sm:text-xs text-gray-400">Nhận thông báo khi phim mới ra mắt & khuyến mại.</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
          <button onClick={dismiss} className="px-2 py-1.5 sm:px-3 py-1.5 text-[10px] sm:text-xs text-gray-400 hover:text-white">
            Để sau
          </button>
          <button
            onClick={requestPermission}
            className="px-2 py-1.5 sm:px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs font-semibold rounded-md sm:rounded-lg transition-colors"
          >
            Bật ngay
          </button>
        </div>
      </div>
    </div>
  );
}
