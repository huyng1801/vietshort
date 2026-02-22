'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaymentResult } from '@/components/payment';
import type { PaymentStatus } from '@/components/payment';

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

  return <PaymentResult status={status} message={message} transactionId={transactionId} />;
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
