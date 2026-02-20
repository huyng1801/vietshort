/**
 * Video player utility functions
 */

/**
 * Format time in seconds to MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Get CSS classes for subtitle size
 */
export function getSubtitleSizeClass(subtitleSize: 'small' | 'medium' | 'large'): string {
  switch (subtitleSize) {
    case 'small':
      return 'text-xs sm:text-sm';
    case 'large':
      return 'text-base sm:text-xl';
    default:
      return 'text-sm sm:text-base';
  }
}
