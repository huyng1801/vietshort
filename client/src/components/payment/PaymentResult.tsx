import { CheckCircle, XCircle, Clock, ArrowLeft, Coins, Crown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type PaymentStatus = 'success' | 'failed' | 'pending' | 'loading';

const STATUS_CONFIG: Record<
  PaymentStatus,
  { icon: React.ElementType; iconColor: string; bg: string; title: string }
> = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
    title: 'Giao dịch thành công!',
  },
  failed: {
    icon: XCircle,
    iconColor: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    title: 'Giao dịch thất bại',
  },
  pending: {
    icon: Clock,
    iconColor: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    title: 'Đang xử lý',
  },
  loading: {
    icon: Clock,
    iconColor: 'text-gray-400',
    bg: 'bg-gray-500/10 border-gray-500/30',
    title: 'Đang tải...',
  },
};

interface PaymentResultProps {
  status: PaymentStatus;
  message: string;
  transactionId: string | null;
}

export function PaymentResult({ status, message, transactionId }: PaymentResultProps) {
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="max-w-md mx-auto px-2 py-12">
      <div className={cn('rounded-2xl border p-8 text-center', config.bg)}>
        <Icon className={cn('w-16 h-16 mx-auto mb-4', config.iconColor)} />
        <h1 className="text-xl font-bold text-white mb-2">{config.title}</h1>
        <p className="text-gray-300 mb-2">{message}</p>
        {transactionId && (
          <p className="text-xs text-gray-500">Mã giao dịch: {transactionId}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-8 space-y-3">
        {status === 'success' && (
          <>
            <Link
              href="/wallet"
              className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors"
            >
              <Coins className="w-4 h-4" /> Xem ví của tôi
            </Link>
            <Link
              href="/vip"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              <Crown className="w-4 h-4" /> Nâng cấp VIP
            </Link>
          </>
        )}
        {status === 'failed' && (
          <Link
            href="/wallet"
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
          >
            Thử lại
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Link>
      </div>

      {/* Info note */}
      {status === 'success' && (
        <p className="text-xs text-gray-500 text-center mt-6">
          Tài khoản của bạn đã được cập nhật. Nếu chưa thấy thay đổi, vui lòng tải lại trang.
        </p>
      )}
      {status === 'pending' && (
        <p className="text-xs text-gray-500 text-center mt-6">
          Giao dịch có thể mất 1-5 phút để xử lý. Nếu sau 10 phút chưa nhận được, vui lòng liên hệ hỗ trợ.
        </p>
      )}
    </div>
  );
}
