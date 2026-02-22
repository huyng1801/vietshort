import { Save, Check, Loader2 } from 'lucide-react';

interface SaveButtonProps {
  saving: boolean;
  saveSuccess: boolean;
  onSave: () => void;
}

export function SaveButton({ saving, saveSuccess, onSave }: SaveButtonProps) {
  return (
    <div className="mt-10 sm:mt-12 w-full flex justify-center pb-8">
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang lưu...
          </>
        ) : saveSuccess ? (
          <>
            <Check className="w-5 h-5" />
            Đã lưu
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Lưu thay đổi
          </>
        )}
      </button>
    </div>
  );
}
