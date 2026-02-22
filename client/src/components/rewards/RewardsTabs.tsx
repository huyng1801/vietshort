import { Calendar, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RewardsTab = 'checkin' | 'quests' | 'achievements';

const TABS = [
  { key: 'checkin' as RewardsTab, label: 'Điểm danh', icon: Calendar },
  { key: 'quests' as RewardsTab, label: 'Nhiệm vụ', icon: Zap },
  { key: 'achievements' as RewardsTab, label: 'Thành tích', icon: Trophy },
];

interface RewardsTabsProps {
  activeTab: RewardsTab;
  onTabChange: (tab: RewardsTab) => void;
}

export function RewardsTabs({ activeTab, onTabChange }: RewardsTabsProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 bg-gray-800/50 rounded-lg sm:rounded-xl p-1.5 sm:p-2 mb-4 sm:mb-5 lg:mb-6">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 lg:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all',
              isActive
                ? 'bg-gray-700 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
            )}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
