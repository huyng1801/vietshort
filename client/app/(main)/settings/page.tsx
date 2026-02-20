'use client';

import { useState, useEffect } from 'react';
import {
  Camera,
  Save,
  Loader2,
  Check,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { Breadcrumb } from '@/components/common/Breadcrumb';

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  language?: string;
}

const GENDER_OPTIONS = [
  { value: '', label: 'Chưa xác định' },
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    nickname: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    avatar: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = (await userApi.getProfile()) as UserProfile;
        setProfile(data);
        setForm({
          nickname: data.nickname || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          gender: data.gender || '',
          avatar: data.avatar || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Không thể tải thông tin hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setError(null);

      const payload: Record<string, string> = {};
      if (form.nickname !== profile.nickname) payload.nickname = form.nickname;
      if (form.firstName !== (profile.firstName || '')) payload.firstName = form.firstName;
      if (form.lastName !== (profile.lastName || '')) payload.lastName = form.lastName;
      if (form.phone !== (profile.phone || '')) payload.phone = form.phone;
      if (form.gender !== (profile.gender || '')) payload.gender = form.gender;
      if (form.avatar !== (profile.avatar || '')) payload.avatar = form.avatar;

      const profileDob = profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '';
      if (form.dateOfBirth !== profileDob) payload.dateOfBirth = form.dateOfBirth;

      if (Object.keys(payload).length === 0) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        return;
      }

      await userApi.updateProfile(payload);

      // Update local auth store
      updateUser({
        nickname: form.nickname,
        avatar: form.avatar || undefined,
      });

      // Update local profile state
      setProfile((prev) => (prev ? { ...prev, ...payload } : prev));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8 bg-[#0a0a0a]">
      <div className="mx-auto px-2 lg:px-32 pt-20 lg:pt-24">
        <Breadcrumb items={[{ label: 'C\u00e0i \u0111\u1eb7t' }]} />
        {/* Page Title */}
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-6 text-center">Cài đặt hồ sơ</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 w-full max-w-2xl text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 w-full max-w-2xl flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-green-400 text-sm">Cập nhật hồ sơ thành công!</p>
          </div>
        )}

        <div className="w-full max-w-5xl">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                {form.avatar ? (
                  <Image
                    src={form.avatar}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-500" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-2">Ảnh đại diện</p>
              <input
                type="text"
                value={form.avatar}
                onChange={(e) => handleChange('avatar', e.target.value)}
                placeholder="Nhập URL ảnh đại diện (https://...)"
                className="w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Hỗ trợ URL HTTPS</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biệt danh <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => handleChange('nickname', e.target.value)}
                placeholder="Nhập biệt danh (3-30 ký tự)"
                maxLength={30}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Chữ cái, số, dấu cách và gạch dưới</p>
            </div>

            {/* First + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Họ</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Nhập họ"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tên</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Nhập tên"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0912345678"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ngày sinh</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Giới tính</label>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChange('gender', opt.value)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/50 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">Email không thể thay đổi</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-10 pb-8 w-full flex justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
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
        </div>
      </div>
    </div>
  );
}
