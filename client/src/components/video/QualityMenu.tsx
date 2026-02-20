import { QualityLevel } from './VideoPlayerTypes';

interface QualityMenuProps {
  qualityLevels: QualityLevel[];
  currentQuality: number;
  onQualityChange: (level: number) => void;
}

export function QualityMenu({ qualityLevels, currentQuality, onQualityChange }: QualityMenuProps) {
  return (
    <div className="absolute bottom-full mb-3 right-0 bg-black/90 rounded-xl py-1 w-48 shadow-2xl z-50">
      <button
        onClick={() => onQualityChange(-1)}
          className={`block w-full px-3 py-2 text-lg font-medium text-left transition-colors ${currentQuality === -1 ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}
      >
        Tự động
      </button>
      {qualityLevels.map((level, idx) => (
        <button
          key={idx}
          onClick={() => onQualityChange(idx)}
          className={`block w-full px-3 py-2 text-lg font-medium text-left transition-colors ${currentQuality === idx ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
