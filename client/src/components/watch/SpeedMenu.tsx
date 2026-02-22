import { PLAYBACK_SPEEDS } from '@/lib/constants';

interface SpeedMenuProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export function SpeedMenu({ playbackSpeed, onSpeedChange }: SpeedMenuProps) {
  return (
    <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-xl border border-white/5 rounded-lg py-0.5 w-28 sm:w-32 shadow-2xl z-[60]">
      {PLAYBACK_SPEEDS.map((speed) => (
        <button
          key={speed}
          onClick={() => onSpeedChange(speed)}
          className={`block w-full px-2.5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-left transition-colors ${playbackSpeed === speed ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}
        >
          {speed}x {speed === 1 ? '(Bình thường)' : ''}
        </button>
      ))}
    </div>
  );
}
