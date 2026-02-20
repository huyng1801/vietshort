'use client';

import { useState, useEffect } from 'react';
import { Coins, Gift, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { paymentApi, walletApi, type CreatePaymentParams } from '@/lib/api';
import { GOLD_PACKAGES_FALLBACK, type GoldPackage } from '@/types/payment';
import { PaymentMethodSelector, type PaymentMethod } from './PaymentMethodSelector';
import { formatVNDFull } from './VipPlans';
import { cn } from '@/lib/utils';

interface GoldTopUpProps {
  onSuccess?: () => void;
}

export function GoldTopUp({ onSuccess }: GoldTopUpProps) {
  const [packages, setPackages] = useState<GoldPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<GoldPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await walletApi.getGoldPackages();
        if (data && data.length > 0) {
          setPackages(data);
        } else {
          setPackages(GOLD_PACKAGES_FALLBACK);
        }
      } catch {
        setPackages(GOLD_PACKAGES_FALLBACK);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPkg || !paymentMethod) return;
    setProcessing(true);
    setError(null);
    try {
      const params: CreatePaymentParams = {
        type: 'BUY_GOLD',
        amount: selectedPkg.price,
        goldAmount: selectedPkg.gold + (selectedPkg.bonus || 0),
        provider: paymentMethod,
        description: `Nạp ${selectedPkg.gold} Gold${selectedPkg.bonus ? ` (+${selectedPkg.bonus} bonus)` : ''}`,
      };
      const result = await paymentApi.create(params);
      // Redirect to payment URL
      window.location.href = result.paymentUrl;
    } catch (err: any) {
      setError(err?.message || 'Tạo giao dịch thất bại');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Gold package grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Chọn gói Gold</h3>
        <p className="text-sm text-gray-400 mb-5">Chọn gói phù hợp để nạp Gold vào ví của bạn</p>

        {loadingPackages ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="ml-3 text-gray-400">Đang tải bảng giá...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isSelected = selectedPkg?.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={cn(
                    'relative rounded-2xl border-2 p-5 text-center transition-all',
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/15 scale-[1.02]'
                      : 'border-gray-700 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800/80',
                    pkg.popular && !isSelected && 'border-amber-500/30',
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 rounded-full text-xs font-bold text-black whitespace-nowrap">
                      Phổ biến
                    </div>
                  )}
                  {pkg.bonus ? (
                    <div className="absolute -top-2.5 right-2 px-2 py-0.5 bg-green-500 rounded-full text-[11px] font-bold text-white">
                      +{pkg.bonus}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Coins className="w-6 h-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{pkg.gold}</span>
                  </div>
                  {pkg.bonus ? (
                    <div className="text-xs text-green-400 mb-2 flex items-center justify-center gap-1">
                      <Gift className="w-3.5 h-3.5" /> +{pkg.bonus} bonus
                    </div>
                  ) : null}
                  <div className="text-base font-medium text-gray-300">{formatVNDFull(pkg.price)}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment method */}
      {selectedPkg && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Phương thức thanh toán</h3>
          <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>
      )}

      {/* Confirm */}
      {selectedPkg && paymentMethod && (
        <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base text-gray-400">Gói đã chọn</span>
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-lg">
              <Coins className="w-5 h-5" />
              {selectedPkg.gold}{selectedPkg.bonus ? ` + ${selectedPkg.bonus}` : ''}
            </div>
          </div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-base text-gray-400">Tổng thanh toán</span>
            <span className="text-xl font-bold text-white">{formatVNDFull(selectedPkg.price)}</span>
          </div>

          <button
            onClick={handlePurchase}
            disabled={processing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-xl text-base font-bold text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
            {processing ? 'Đang xử lý...' : 'Thanh toán ngay'}
          </button>

          {error && <p className="text-sm text-red-400 text-center mt-3">{error}</p>}
        </div>
      )}
    </div>
  );
}
