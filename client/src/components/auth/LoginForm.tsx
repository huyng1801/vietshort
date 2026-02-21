'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { OAuthButtons } from './OAuthButtons';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      onSuccess?.();
      router.push('/');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-red-500 focus:ring-red-500 focus:ring-offset-gray-900"
            />
            <span className="text-sm text-gray-400">Ghi nhớ đăng nhập</span>
          </label>
          <Link href="/forgot-password" className="text-sm sm:text-base text-red-500 hover:text-red-400 transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5 sm:my-6">
        <div className="flex-1 h-px bg-gray-700/50" />
        <span className="text-xs sm:text-sm text-gray-500 px-1">Đăng nhập với</span>
        <div className="flex-1 h-px bg-gray-700/50" />
      </div>

      {/* OAuth Buttons */}
      <OAuthButtons />

      {/* Register Link */}
      <p className="mt-5 sm:mt-6 text-center text-sm sm:text-base text-gray-400">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}