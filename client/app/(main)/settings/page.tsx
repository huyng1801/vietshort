'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Save,
  Loader2,
  Check,
  ArrowLeft,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { userApi } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { UserAvatar } from '@/components/common/UserAvatar';

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
  const { isAuthenticated, updateUser, user } = useAuthStore();
  const _hasHydrated = useHasHydrated();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!_hasHydrated) return; // Wait for localStorage hydration
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
  }, [_hasHydrated, isAuthenticated, router]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước hình ảnh không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { accessToken } = useAuthStore.getState();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiUrl}/users/avatar-upload`, {
        method: 'POST',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload thất bại');
      }

      const { url } = await response.json();
      // Append a cache-buster so the browser fetches the new image
      // instead of serving the old one from cache (R2 uses the same URL per user)
      const bustedUrl = `${url}?t=${Date.now()}`;
      handleChange('avatar', bustedUrl);
      // Update the auth store so Header and all other components show the new avatar
      updateUser({ avatar: bustedUrl });
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Lỗi khi upload hình ảnh');
    } finally {
      setUploading(false);
    }
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

      updateUser({
        nickname: form.nickname,
        avatar: form.avatar || undefined,
      });

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

  const displayUser = {
    ...user,
    avatar: form.avatar || user?.avatar,
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-20 lg:pb-8 bg-[#0a0a0a]">
      {/* Desktop: Back Button */}
      <div className="hidden lg:flex px-4 sm:px-6 lg:px-32 pt-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Quay lại</span>
        </button>
      </div>

      <div className="mx-auto px-3 sm:px-4 lg:px-32 pt-12 sm:pt-20 lg:pt-24">
        <Breadcrumb items={[{ label: 'Cài đặt' }]} />
        
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-10 text-center">Cài đặt hồ sơ</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 w-full">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 w-full flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-green-400 text-sm">Cập nhật hồ sơ thành công!</p>
          </div>
        )}

        <div className="w-full">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6 mb-10 sm:mb-12">
            <div className="relative group">
              <UserAvatar
                user={displayUser}
                size="xl"
                showBadge
                className="cursor-pointer"
              />
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
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
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

          {/* Profile Form */}
          <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto">
            {/* Nickname */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
                Biệt danh <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => handleChange('nickname', e.target.value)}
                placeholder="Nhập biệt danh (3-30 ký tự)"
                maxLength={30}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
            </div>

            {/* First + Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Họ</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Nhập họ"
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Tên</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Nhập tên"
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0912345678"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">Ngày sinh</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-3">Giới tính</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChange('gender', opt.value)}
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

          {/* Save Button */}
          <div className="mt-10 sm:mt-12 w-full flex justify-center pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
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
