'use client';

import { LoginForm } from '@/components/auth';
import { Film, Play, Star } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm sm:max-w-lg lg:max-w-6xl">
      <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Left branding panel — desktop only */}
        <div className="hidden lg:flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">Xem phim ngắn chất lượng cao</h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Hàng nghìn tập phim, hoạt hình, và nội dung sáng tạo — miễn phí và VIP.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Play, label: 'Phát trực tiếp HD, Full HD', desc: 'Chất lượng cao nhất trên mọi thiết bị' },
              { icon: Star, label: 'Gold & Điểm danh', desc: 'Điểm danh hàng ngày — nhận Gold miễn phí' },
              { icon: Film, label: 'VIP không quảng cáo', desc: 'Trải nghiệm xem phim không bị gián đoạn' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-700/50">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1.5 sm:mb-2">Chào mừng trở lại</h2>
            <p className="text-gray-400 text-sm sm:text-base">Đăng nhập để tiếp tục xem phim</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}