'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Calendar, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { OAuthButtons } from './OAuthButtons';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    birthYear: '',
    agreeTerms: false,
    agreeMarketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    clearError();
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.nickname.length < 2) {
      errors.nickname = 'Tên hiển thị phải có ít nhất 2 ký tự';
    }

    if (!formData.birthYear) {
      errors.birthYear = 'Vui lòng chọn năm sinh';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Bạn cần đồng ý với điều khoản sử dụng';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        birthYear: parseInt(formData.birthYear),
      });
      onSuccess?.();
      router.push('/');
    } catch (err) {
      // Error is handled by store
    }
  };

  // Generate year options (18+ years ago to 100 years ago)
  const currentYear = isMounted ? new Date().getFullYear() : 2024;
  const yearOptions = Array.from(
    { length: 82 },
    (_, i) => currentYear - 18 - i
  );

  if (!isMounted) {
    return <div className="w-full animate-pulse"><div className="h-96 bg-gray-800/50 rounded-xl"></div></div>;
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
            Email <span className="text-red-500">*</span>
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

        {/* Nickname Field */}
        <div>
          <label htmlFor="nickname" className="block text-sm sm:text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
            Tên hiển thị <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              value={formData.nickname}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              placeholder="Tên của bạn"
            />
          </div>
          {validationErrors.nickname && (
            <p className="text-red-400 text-xs sm:text-sm mt-1">{validationErrors.nickname}</p>
          )}
        </div>

        {/* Birth Year Field */}
        <div>
          <label htmlFor="birthYear" className="block text-sm sm:text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
            Năm sinh <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <select
              id="birthYear"
              name="birthYear"
              required
              value={formData.birthYear}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all appearance-none"
            >
              <option value="">Chọn năm sinh</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {validationErrors.birthYear && (
            <p className="text-red-400 text-xs sm:text-sm mt-1">{validationErrors.birthYear}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
            Mật khẩu <span className="text-red-500">*</span>
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
              placeholder="Ít nhất 8 ký tự"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-red-400 text-xs sm:text-sm mt-1">{validationErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="text-red-400 text-xs sm:text-sm mt-1">{validationErrors.confirmPassword}</p>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="space-y-2.5 sm:space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 bg-gray-800/60 border-gray-700/50 rounded text-red-500 focus:ring-red-500/50 focus:ring-offset-0 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Tôi đồng ý với{' '}
              <Link href="/terms" className="text-red-500 hover:text-red-400 transition-colors">Điều khoản sử dụng</Link>
              {' '}và{' '}
              <Link href="/privacy" className="text-red-500 hover:text-red-400 transition-colors">Chính sách bảo mật</Link>
              {' '}<span className="text-red-500">*</span>
            </span>
          </label>
          {validationErrors.agreeTerms && (
            <p className="text-red-400 text-xs sm:text-sm">{validationErrors.agreeTerms}</p>
          )}

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="agreeMarketing"
              checked={formData.agreeMarketing}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 bg-gray-800/60 border-gray-700/50 rounded text-red-500 focus:ring-red-500/50 focus:ring-offset-0 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Tôi đồng ý nhận thông tin khuyến mãi và cập nhật từ VietShort
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl">
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
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
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              Đang đăng ký...
            </>
          ) : (
            'Đăng ký'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5 sm:my-6">
        <div className="flex-1 h-px bg-gray-700/50" />
        <span className="text-xs sm:text-sm text-gray-500 px-1">Đăng ký với</span>
        <div className="flex-1 h-px bg-gray-700/50" />
      </div>

      {/* OAuth Buttons */}
      <OAuthButtons />

      {/* Login Link */}
      <p className="mt-5 sm:mt-6 text-center text-sm sm:text-base text-gray-400">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}