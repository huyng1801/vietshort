'use client';

import { useState, useEffect } from 'react';
import { Trophy, Lock, CheckCircle, Coins, LayoutGrid, List } from 'lucide-react';
import { achievementsApi } from '@/lib/api';
import type { Achievement } from '@/types/gamification';
import { ACHIEVEMENT_UI, DEFAULT_ACHIEVEMENT_UI } from '@/types/gamification';
import { GamificationIcon } from './icons';
import { cn } from '@/lib/utils';

// ─── Achievement Badge ──────────────────────────────────────
interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const ui = ACHIEVEMENT_UI[achievement.id] || DEFAULT_ACHIEVEMENT_UI;

  const sizes = {
    sm: 'w-12 h-12 sm:w-14 sm:h-14',
    md: 'w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] lg:w-20 lg:h-20',
    lg: 'w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] lg:w-24 lg:h-24',
  };
  const iconSizes = { sm: 'w-4 h-4 sm:w-5 sm:h-5', md: 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8', lg: 'w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10' };
  const textSizes = { sm: 'text-[10px] sm:text-xs', md: 'text-xs sm:text-sm', lg: 'text-sm sm:text-base' };

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-1.5">
      <div
        className={cn(
          'relative rounded-xl sm:rounded-2xl flex items-center justify-center border-2 transition-all',
          sizes[size],
          achievement.claimed
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
            : 'bg-gray-800/50 border-white/10 opacity-50 grayscale',
        )}
      >
        <GamificationIcon
          name={ui.icon}
          className={cn(iconSizes[size], achievement.claimed ? 'text-amber-400' : 'text-gray-500 opacity-40')}
        />
        {achievement.claimed && (
          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-black">
            <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
          </div>
        )}
        {!achievement.claimed && (
          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-700 rounded-full flex items-center justify-center border-2 border-black">
            <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-gray-400" />
          </div>
        )}
      </div>
      <span className={cn(textSizes[size], 'text-center font-medium text-gray-400 max-w-[60px] sm:max-w-[80px] line-clamp-2')}>
        {achievement.name}
      </span>
    </div>
  );
}

// ─── Achievement Card (expanded) ────────────────────────────
interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const ui = ACHIEVEMENT_UI[achievement.id] || DEFAULT_ACHIEVEMENT_UI;

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 sm:gap-3 lg:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all',
        achievement.claimed
          ? 'bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20'
          : 'bg-gray-800/30 border-white/10',
      )}
    >
      {/* Badge icon */}
      <div
        className={cn(
          'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 border',
          achievement.claimed
            ? 'bg-amber-500/20 border-amber-500/40'
            : 'bg-gray-800/80 border-white/10 grayscale opacity-60',
        )}
      >
        <GamificationIcon
          name={ui.icon}
          className={cn('w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8', achievement.claimed ? 'text-amber-400' : 'text-gray-500')}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4 className={cn('text-sm sm:text-base lg:text-lg font-semibold truncate', achievement.claimed ? 'text-white' : 'text-gray-400')}>
          {achievement.name}
        </h4>
        {achievement.description && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">{achievement.description}</p>
        )}
      </div>

      {/* Reward */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1 sm:gap-1.5">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Coins className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', achievement.claimed ? 'text-amber-400' : 'text-gray-600')} />
          <span className={cn('text-sm sm:text-base font-bold', achievement.claimed ? 'text-amber-400' : 'text-gray-600')}>
            {achievement.reward}
          </span>
        </div>
        {achievement.claimed ? (
          <span className="text-[10px] sm:text-xs lg:text-sm text-green-400 font-medium">Đã nhận</span>
        ) : (
          <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500">Chưa mở khóa</span>
        )}
      </div>
    </div>
  );
}

// ─── Achievements Panel ─────────────────────────────────────
export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    achievementsApi
      .getAll()
      .then(setAchievements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const claimed = achievements.filter((a) => a.claimed);
  const unclaimed = achievements.filter((a) => !a.claimed);
  const totalReward = achievements.reduce((s, a) => s + a.reward, 0);
  const earnedReward = claimed.reduce((s, a) => s + a.reward, 0);

  if (loading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 sm:gap-1.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-800/50 rounded-xl sm:rounded-2xl animate-pulse" />
            <div className="w-10 sm:w-12 h-2.5 sm:h-3 bg-gray-800/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-gray-500">
        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-50" />
        <p className="text-sm sm:text-base">Chưa có thành tích nào</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          <span className="text-xs sm:text-sm lg:text-base text-gray-300">
            <span className="text-white font-bold">{claimed.length}</span>/{achievements.length} thành tích
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-amber-400">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-bold">{earnedReward}</span>
            <span className="text-gray-500">/ {totalReward}</span>
          </div>
          {/* View toggle */}
          <div className="flex bg-gray-800/50 rounded-lg p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn('px-1.5 py-0.5 sm:px-2 py-1 rounded text-xs transition-colors', view === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500')}
            >
              <LayoutGrid className="w-3 h-3" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('px-1.5 py-0.5 sm:px-2 py-1 rounded text-xs transition-colors', view === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500')}
            >
              <List className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 sm:h-2 bg-gray-800 rounded-full mb-4 sm:mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
          style={{ width: `${achievements.length > 0 ? (claimed.length / achievements.length) * 100 : 0}%` }}
        />
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Claimed first, then unclaimed */}
          {[...claimed, ...unclaimed].map((a) => (
            <AchievementBadge key={a.id} achievement={a} />
          ))}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {claimed.length > 0 && (
            <>
              <h4 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Đã đạt được</h4>
              {claimed.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </>
          )}
          {unclaimed.length > 0 && (
            <>
              <h4 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 mt-4 sm:mt-5">Chưa mở khóa</h4>
              {unclaimed.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Achievement Showcase (horizontal scroll for homepage) ──
interface AchievementShowcaseProps {
  limit?: number;
}

export function AchievementShowcase({ limit = 6 }: AchievementShowcaseProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    achievementsApi
      .getAll()
      .then((all) => {
        // Show claimed achievements first, then closest to completion
        const claimed = all.filter((a) => a.claimed);
        const unclaimed = all.filter((a) => !a.claimed);
        setAchievements([...claimed, ...unclaimed].slice(0, limit));
      })
      .catch(() => {});
  }, [limit]);

  if (achievements.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
      {achievements.map((a) => (
        <AchievementBadge key={a.id} achievement={a} size="sm" />
      ))}
    </div>
  );
}
