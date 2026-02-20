'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, ArrowLeft, Coins, Crown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type PaymentStatus = 'success' | 'failed' | 'pending' | 'loading';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [message, setMessage] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // VNPay returns: vnp_ResponseCode, vnp_TransactionNo, vnp_Amount, vnp_TxnRef
    // MoMo returns: resultCode, message, orderId, amount
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const momoResultCode = searchParams.get('resultCode');
    const txnRef = searchParams.get('vnp_TxnRef') || searchParams.get('orderId');

    setTransactionId(txnRef);

    if (vnpResponseCode !== null) {
      // VNPay callback
      if (vnpResponseCode === '00') {
        setStatus('success');
        setMessage('Thanh toán VNPay thành công!');
      } else if (vnpResponseCode === '24') {
        setStatus('failed');
        setMessage('Bạn đã hủy giao dịch.');
      } else {
        setStatus('failed');
        setMessage(`Thanh toán thất bại (mã lỗi: ${vnpResponseCode}).`);
      }
    } else if (momoResultCode !== null) {
      // MoMo callback
      if (momoResultCode === '0') {
        setStatus('success');
        setMessage('Thanh toán MoMo thành công!');
      } else if (momoResultCode === '1006') {
        setStatus('failed');
        setMessage('Bạn đã hủy giao dịch MoMo.');
      } else {
        setStatus('failed');
        setMessage(`Thanh toán MoMo thất bại (mã: ${momoResultCode}).`);
      }
    } else {
      // No recognized params — might be direct navigation or pending
      setStatus('pending');
      setMessage('Đang xử lý giao dịch, vui lòng đợi...');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const config = {
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
  }[status];

  const Icon = config.icon;

  return (
    <div className="max-w-md mx-auto px-2 py-12\">
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
          <>
            <Link
              href="/wallet"
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
            >
              Thử lại
            </Link>
          </>
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

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
