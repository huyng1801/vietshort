'use client';

import { User as UserIcon, Crown, Zap } from 'lucide-react';

interface User {
  avatar?: string;
  vipTier?: 'VIP_GOLD' | 'VIP_FREEADS' | null;
  nickname?: string;
}

interface UserAvatarProps {
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const badgeSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const badgeIconSizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
};

const badgePositionClasses = {
  xs: '-bottom-0.5 -right-0.5',
  sm: '-bottom-0.5 -right-0.5',
  md: '-bottom-1 -right-1',
  lg: '-bottom-1 -right-1',
  xl: '-bottom-1.5 -right-1.5',
};

export function UserAvatar({
  user,
  size = 'md',
  showBadge = true,
  className = '',
  onClick,
}: UserAvatarProps) {
  const vipTier = user?.vipTier ?? null;
  const isVipGold = vipTier === 'VIP_GOLD';
  const isVipFreeAds = vipTier === 'VIP_FREEADS';
  const hasVip = isVipGold || isVipFreeAds;
  // Ring classes - use Tailwind with glow animation
  let ringClasses = '';
  if (isVipGold) {
    ringClasses = 'ring-2 ring-yellow-400 ring-glow-gold';
  } else if (isVipFreeAds) {
    ringClasses = 'ring-2 ring-blue-400 ring-glow-blue';
  } else {
    ringClasses = 'ring-1 ring-gray-600';
  }

  const containerClass = onClick
    ? 'relative cursor-pointer'
    : 'relative';

  // Use size classes from the predefined sizes, className is only for additional customization
  const sizeClass = sizeClasses[size];

  return (
    <div className={`${containerClass} ${sizeClass} ${className}`} onClick={onClick}>
      {/* Avatar Container */}
      <div
        className={`${sizeClass} ${ringClasses} bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}
        style={{
          transition: 'all 300ms ease-in-out',
        }}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.nickname || 'User'}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <UserIcon className={`${iconSizeClasses[size]} text-gray-400`} />
        )}
      </div>

      {/* VIP Status Badge */}
      {showBadge && hasVip && (
        <div className={`absolute ${badgePositionClasses[size]} flex items-center justify-center z-20 pointer-events-none`}>
          {isVipGold ? (
            <div
              className={`${badgeSizeClasses[size]} flex items-center justify-center badge-shimmer-gold rounded-full shadow-lg`}
              style={{
                boxShadow: '0 0 12px rgba(250, 204, 21, 0.8), 0 0 8px rgba(251, 146, 60, 0.6)',
              }}
            >
              <Crown className={`${badgeIconSizeClasses[size]} text-white drop-shadow-lg`} />
            </div>
          ) : (
            <div
              className={`${badgeSizeClasses[size]} flex items-center justify-center badge-shimmer-blue rounded-full shadow-lg`}
              style={{
                boxShadow: '0 0 12px rgba(96, 165, 250, 0.8), 0 0 8px rgba(34, 211, 238, 0.6)',
              }}
            >
              <Zap className={`${badgeIconSizeClasses[size]} text-white drop-shadow-lg`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
