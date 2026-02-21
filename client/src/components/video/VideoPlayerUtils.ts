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
      return 'text-xs sm:text-sm lg:text-base';
    case 'large':
      return 'text-base sm:text-xl lg:text-2xl';
    default:
      return 'text-sm sm:text-base lg:text-lg';
  }
}

// ─── SRT Subtitle Parser ─────────────────────────────────────

export interface SubtitleCue {
  index: number;
  startTime: number; // seconds
  endTime: number;   // seconds
  text: string;
}

/**
 * Parse SRT timestamp (00:01:23,456) to seconds
 */
function parseSrtTimestamp(ts: string): number {
  const parts = ts.trim().replace(',', '.').split(':');
  if (parts.length === 3) {
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  }
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return 0;
}

/**
 * Parse an SRT string into an array of SubtitleCue objects
 */
export function parseSrt(srtContent: string): SubtitleCue[] {
  if (!srtContent || !srtContent.trim()) return [];

  const cues: SubtitleCue[] = [];
  // Normalize line endings and split by double newline
  const blocks = srtContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
    .split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    // Find the timestamp line (contains -->)
    let tsLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        tsLineIdx = i;
        break;
      }
    }
    if (tsLineIdx === -1) continue;

    const tsLine = lines[tsLineIdx];
    const tsParts = tsLine.split('-->');
    if (tsParts.length !== 2) continue;

    const startTime = parseSrtTimestamp(tsParts[0]);
    const endTime = parseSrtTimestamp(tsParts[1]);
    const text = lines.slice(tsLineIdx + 1).join('\n').trim();
    const index = tsLineIdx > 0 ? parseInt(lines[0]) || cues.length + 1 : cues.length + 1;

    if (text && endTime > startTime) {
      cues.push({ index, startTime, endTime, text });
    }
  }

  return cues;
}

/**
 * Find the active subtitle cue for a given time
 */
export function findActiveCue(cues: SubtitleCue[], currentTime: number): string {
  for (const cue of cues) {
    if (currentTime >= cue.startTime && currentTime <= cue.endTime) {
      return cue.text;
    }
  }
  return '';
}
