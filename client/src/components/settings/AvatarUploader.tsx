import { useRef } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import { UserAvatar } from '@/components/common';

interface AvatarUploaderProps {
  user: { avatar?: string; nickname?: string; vipTier?: 'VIP_GOLD' | 'VIP_FREEADS' | null } | null;
  uploading: boolean;
  onFileSelect: (file: File) => void;
}

export function AvatarUploader({ user, uploading, onFileSelect }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-6 mb-10 sm:mb-12">
      <div className="relative group">
        <UserAvatar user={user} size="xl" showBadge className="cursor-pointer" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer disabled:bg-black/40"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        className="hidden"
        disabled={uploading}
      />
      <div className="text-center">
        <p className="text-white font-medium text-sm sm:text-base mb-1">Ảnh đại diện</p>
        <p className="text-gray-400 text-xs sm:text-sm flex items-center justify-center gap-1">
          <Upload className="w-4 h-4" />
          Nhấp vào avatar để tải ảnh
        </p>
        <p className="text-gray-500 text-xs mt-1">Tối đa 5MB, định dạng: JPG, PNG, GIF</p>
      </div>
    </div>
  );
}
