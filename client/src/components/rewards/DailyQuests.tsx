'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle, Coins, Zap, Play, Tv, PartyPopper } from 'lucide-react';
import { dailyTasksApi } from '@/lib/api';
import type { DailyTaskStatus } from '@/types/gamification';
import { TASK_ICONS } from '@/types/gamification';
import { GamificationIcon } from './icons';
import { cn } from '@/lib/utils';

// ─── Quest Card ─────────────────────────────────────────────
interface QuestCardProps {
  task: DailyTaskStatus;
}

function QuestCard({ task }: QuestCardProps) {
  const progress = task.target > 0 ? Math.min(task.current / task.target, 1) : 0;
  const icon = TASK_ICONS[task.id] || TASK_ICONS[task.id.split('_')[0]?.toUpperCase() + '_VIDEO'] || 'Target';

  return (
    <div
      className={cn(
        'relative flex items-center gap-2.5 sm:gap-3 lg:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all',
        task.completed
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-gray-800/50 border-white/10 hover:bg-gray-800/80',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0',
          task.completed ? 'bg-green-500/20' : 'bg-gray-700/80',
        )}
      >
        <GamificationIcon
          name={icon}
          className={cn('w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7', task.completed ? 'text-green-400' : 'text-gray-400')}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <h4 className={cn('text-sm sm:text-base lg:text-lg font-semibold truncate', task.completed ? 'text-green-400' : 'text-white')}>
            {task.name}
          </h4>
          <div className="flex items-center gap-1 sm:gap-1.5 text-amber-400 flex-shrink-0 ml-2">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm lg:text-base font-bold">+{task.reward}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                task.completed ? 'bg-green-500' : 'bg-amber-500',
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs lg:text-sm text-gray-400 font-medium flex-shrink-0">
            {task.current}/{task.target}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        {task.completed ? (
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
        ) : (
          <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        )}
      </div>
    </div>
  );
}

// ─── Daily Quests Panel ─────────────────────────────────────
interface DailyQuestsProps {
  onGoldEarned?: (amount: number) => void;
}

export function DailyQuests({ onGoldEarned }: DailyQuestsProps) {
  const [tasks, setTasks] = useState<DailyTaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    dailyTasksApi
      .getTasks()
      .then((res) => {
        setTasks(res.tasks || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalReward = tasks.reduce((s, t) => s + t.reward, 0);
  const earnedReward = tasks.filter((t) => t.completed).reduce((s, t) => s + t.reward, 0);

  if (loading) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 sm:h-16 bg-gray-800/50 rounded-lg sm:rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || tasks.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-gray-500">
        <Tv className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-50" />
        <p className="text-sm sm:text-base">Chưa có nhiệm vụ hôm nay</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          <span className="text-xs sm:text-sm lg:text-base text-gray-300">
            <span className="text-white font-bold">{completedCount}</span>/{tasks.length} nhiệm vụ
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-amber-400">
          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-bold">{earnedReward}</span>
          <span className="text-gray-500">/ {totalReward} Gold</span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="h-1.5 sm:h-2 bg-gray-800 rounded-full mb-4 sm:mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
          style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-2 sm:space-y-3">
        {tasks.map((task) => (
          <QuestCard key={task.id} task={task} />
        ))}
      </div>

      {/* Bonus info */}
      {completedCount === tasks.length && tasks.length > 0 && (
        <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg sm:rounded-xl text-center">
          <p className="text-green-400 font-bold text-base sm:text-lg flex items-center justify-center gap-1.5"><PartyPopper className="w-5 h-5" /> Hoàn thành tất cả nhiệm vụ!</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Quay lại vào ngày mai để nhận thêm Gold</p>
        </div>
      )}
    </div>
  );
}

// ─── Watch Ad Button ────────────────────────────────────────
interface WatchAdButtonProps {
  onReward?: (gold: number) => void;
  className?: string;
}

export function WatchAdButton({ onReward, className }: WatchAdButtonProps) {
  const [watching, setWatching] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleWatch = useCallback(async () => {
    if (watching || cooldown > 0) return;
    setWatching(true);
    // Simulate ad watching (in production, this would integrate with AdMob)
    setTimeout(() => {
      const gold = 10; // 2x base reward
      setWatching(false);
      setCooldown(30); // 30s cooldown
      onReward?.(gold);
    }, 3000);
  }, [watching, cooldown, onReward]);

  return (
    <button
      onClick={handleWatch}
      disabled={watching || cooldown > 0}
      className={cn(
        'flex items-center gap-2.5 px-5 py-4 rounded-xl text-base font-semibold transition-all border',
        watching
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          : cooldown > 0
            ? 'bg-gray-800/50 border-white/10 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20',
        className,
      )}
    >
      <Play className={cn('w-5 h-5', watching && 'animate-pulse')} />
      {watching ? (
        'Đang xem quảng cáo...'
      ) : cooldown > 0 ? (
        `Xem lại sau ${cooldown}s`
      ) : (
        <>Xem quảng cáo <span className="text-sm opacity-70">+10 Gold</span></>
      )}
    </button>
  );
}
