'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm sm:max-w-lg lg:max-w-xl">
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-700/50">
        <div className="text-center mb-5 sm:mb-7">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1.5 sm:mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-400 text-sm sm:text-base">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}