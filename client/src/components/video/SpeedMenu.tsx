import { PLAYBACK_SPEEDS } from '@/lib/constants';

interface SpeedMenuProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export function SpeedMenu({ playbackSpeed, onSpeedChange }: SpeedMenuProps) {
  return (
    <div className="absolute bottom-full mb-3 right-0 bg-black/90 rounded-xl py-1 w-48 shadow-2xl z-50">
      {PLAYBACK_SPEEDS.map((speed) => (
        <button
          key={speed}
          onClick={() => onSpeedChange(speed)}
          className={`block w-full px-3 py-2 text-lg font-medium text-left transition-colors ${playbackSpeed === speed ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}
        >
          {speed}x {speed === 1 ? '(Bình thường)' : ''}
        </button>
      ))}
    </div>
  );
}
