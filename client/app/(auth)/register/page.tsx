'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tạo tài khoản</h1>
          <p className="text-gray-400">Đăng ký để xem hàng nghìn bộ phim hấp dẫn</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}