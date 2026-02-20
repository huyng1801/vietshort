'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-400">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}