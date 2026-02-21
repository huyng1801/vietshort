'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      onSuccess?.();
    } catch (err) {
      // Error is handled by store
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Kiểm tra email của bạn
        </h2>
        <p className="text-sm sm:text-base text-gray-400 mb-5 sm:mb-6">
          Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <span className="text-white">{email}</span>.{' '}
          Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 hover:bg-gray-700/60 text-gray-300 font-medium text-sm sm:text-base rounded-lg sm:rounded-xl transition-colors"
          >
            Gửi lại email
          </button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <p className="text-sm sm:text-base text-gray-400 text-center mb-5 sm:mb-6">
          Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn.
        </p>

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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              placeholder="your@email.com"
            />
          </div>
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
              Đang gửi...
            </>
          ) : (
            'Gửi yêu cầu'
          )}
        </button>

        {/* Back to Login */}
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>
      </form>
    </div>
  );
}