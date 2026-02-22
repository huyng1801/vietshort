import { SubtitleTrack } from './VideoPlayerTypes';

interface SubtitleMenuProps {
  subtitles: SubtitleTrack[];
  activeSubtitle: string | null;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitleBg: boolean;
  onSelect: (id: string | null) => void;
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onBgToggle: () => void;
}

export function SubtitleMenu({ 
  subtitles, 
  activeSubtitle, 
  subtitleSize, 
  subtitleBg, 
  onSelect, 
  onSizeChange, 
  onBgToggle 
}: SubtitleMenuProps) {
  return (
    <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl py-1 w-48 shadow-2xl z-[60]">
      <p className="px-3 py-1.5 text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Phụ đề</p>
      <button
        onClick={() => onSelect(null)}
        className={`block w-full px-3 py-1.5 text-xs font-medium text-left transition-colors ${!activeSubtitle ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}
      >
        Tắt phụ đề
      </button>
      {subtitles.map((sub) => (
        <button
          key={sub.id}
          onClick={() => onSelect(sub.id)}
          className={`block w-full px-3 py-1.5 text-xs font-medium text-left transition-colors ${activeSubtitle === sub.id ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}
        >
          {sub.label}
        </button>
      ))}

      <div className="border-t border-white/5 mt-1 pt-1">
        <p className="px-3 py-1 text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Kích thước</p>
        <div className="flex gap-1 px-3 py-1">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${subtitleSize === size ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              {size === 'small' ? 'Nhỏ' : size === 'medium' ? 'Trung' : 'Lớn'}
            </button>
          ))}
        </div>
        <button
          onClick={onBgToggle}
          className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
        >
          <span>Nền mờ</span>
          <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${subtitleBg ? 'bg-red-600' : 'bg-gray-600'}`}>
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${subtitleBg ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>
    </div>
  );
}
