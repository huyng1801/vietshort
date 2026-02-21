'use client';

import {
  MessageCircle, Share2, Star, Eye, Flame, Trophy, CalendarDays, Target,
  Tv, Clapperboard, Medal, Heart, PartyPopper,
} from 'lucide-react';
import type { ComponentType, SVGAttributes } from 'react';

type IconComponent = ComponentType<SVGAttributes<SVGSVGElement> & { className?: string }>;

/** Centralized icon map for gamification features – keeps all icons from lucide-react
 *  instead of scattering emoji characters across the codebase. */
const ICON_MAP: Record<string, IconComponent> = {
  MessageCircle,
  Share2,
  Star,
  Eye,
  Flame,
  Trophy,
  CalendarDays,
  Target,
  Tv,
  Clapperboard,
  Medal,
  Heart,
  PartyPopper,
};

interface GamificationIconProps {
  /** Lucide icon name string – must match a key in ICON_MAP */
  name: string;
  className?: string;
}

/** Renders a Lucide icon by name string. Used to replace emoji characters
 *  in gamification data maps (ACHIEVEMENT_UI, TASK_ICONS, etc.) */
export function GamificationIcon({ name, className }: GamificationIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
