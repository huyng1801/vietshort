import { QualityLevel } from './VideoPlayerTypes';

interface QualityMenuProps {
  qualityLevels: QualityLevel[];
  currentQuality: number;
  onQualityChange: (level: number) => void;
}

export function QualityMenu({ qualityLevels, currentQuality, onQualityChange }: QualityMenuProps) {
  return (
    <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-xl border border-white/5 rounded-lg py-0.5 w-24 sm:w-28 shadow-2xl z-[60]">
      <button
        onClick={() => onQualityChange(-1)}
        className={`block w-full px-2.5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-left transition-colors ${currentQuality === -1 ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}
      >
        Tự động
      </button>
      {qualityLevels.map((level, idx) => (
        <button
          key={idx}
          onClick={() => onQualityChange(idx)}
          className={`block w-full px-2.5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-left transition-colors ${currentQuality === idx ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
