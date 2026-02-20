'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-700/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Chào mừng trở lại</h1>
          <p className="text-gray-400">Đăng nhập để tiếp tục xem phim</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}