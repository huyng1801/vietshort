import type { UserProfile, ProfileFormState } from './types';

const GENDER_OPTIONS = [
  { value: '', label: 'Chưa xác định' },
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const inputClass =
  'w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all';

interface ProfileFormProps {
  form: ProfileFormState;
  profile: UserProfile | null;
  onChange: (field: string, value: string) => void;
}

export function ProfileForm({ form, profile, onChange }: ProfileFormProps) {
  return (
    <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto">
      {/* Nickname */}
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
          Biệt danh <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.nickname}
          onChange={(e) => onChange('nickname', e.target.value)}
          placeholder="Nhập biệt danh (3-30 ký tự)"
          maxLength={30}
          className={inputClass}
        />
      </div>

      {/* First + Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Họ</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="Nhập họ"
            maxLength={50}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Tên</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Nhập tên"
            maxLength={50}
            className={inputClass}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Số điện thoại</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="0912345678"
          className={inputClass}
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Ngày sinh</label>
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          className={inputClass + ' [color-scheme:dark]'}
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3">Giới tính</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange('gender', opt.value)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                form.gender === opt.value
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:border-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Email (read-only) */}
      {profile?.email && (
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/60 border border-gray-800/50 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-600 mt-1">Email không thể thay đổi</p>
        </div>
      )}
    </div>
  );
}
