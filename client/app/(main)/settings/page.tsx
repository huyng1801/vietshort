'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { userApi } from '@/lib/api';
import { Loading, Breadcrumb } from '@/components/common';
import { AvatarUploader, ProfileForm, SaveButton } from '@/components/settings';
import type { UserProfile, ProfileFormState } from '@/components/settings';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, updateUser, user } = useAuthStore();
  const _hasHydrated = useHasHydrated();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
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
          <AvatarUploader
            user={displayUser}
            uploading={uploading}
            onFileSelect={handleFileSelect}
          />

          {/* Profile Form */}
          <ProfileForm form={form} profile={profile} onChange={handleChange} />

          {/* Save Button */}
          <SaveButton saving={saving} saveSuccess={saveSuccess} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
