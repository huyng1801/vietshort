'use client';

import { useState, useEffect } from 'react';
import { Crown, Shield, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { paymentApi, vipApi, type VipPlan, type CreatePaymentParams } from '@/lib/api';
import {
  VipTierCard, PlanSelector, SavingsCalculator, FeatureComparisonTable,
  formatVNDFull, PaymentMethodSelector,
  VipBadge, DynamicPricingPopup,
} from '@/components/vip';
import type { PlanOption, PaymentMethod } from '@/components/vip';
import { Breadcrumb } from '@/components/common';

export default function VipPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // State
  const [selectedTier, setSelectedTier] = useState<'VIP_FREEADS' | 'VIP_GOLD'>('VIP_GOLD');
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allPlans, setAllPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Current VIP status
  const currentVipTier = user?.vipTier ?? null;
  const isVipActive = !!currentVipTier;

  // Load plans from database
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await vipApi.getPlans();
        // Transform API response to PlanOption format
        const transformed = data.map((plan: VipPlan) => {
          const months = plan.days >= 365 ? 12 : plan.days >= 90 ? 3 : 1;
          const label = plan.days >= 365 ? '1 Năm' : plan.days >= 90 ? '3 Tháng' : '1 Tháng';
          return {
            id: plan.id,
            type: plan.type,
            days: plan.days,
            price: plan.price,
            goldPrice: plan.goldPrice,
            discount: plan.discount,
            label,
            perMonth: Math.round(plan.price / months),
          };
        });
        setAllPlans(transformed);
      } catch (err) {
        console.error('Failed to load VIP plans:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  // Filter plans by selected tier
  const tierPlans = allPlans.filter((p) => p.type === selectedTier);

  const handlePurchase = async () => {
    if (!selectedPlan || !paymentMethod) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const params: CreatePaymentParams = {
        type: 'PURCHASE_VIP',
        amount: selectedPlan.price,
        vipDays: selectedPlan.days,
        provider: paymentMethod,
        description: `${selectedTier === 'VIP_GOLD' ? 'VIP Gold' : 'VIP FreeAds'} - ${selectedPlan.label}`,
      };
      const result = await paymentApi.create(params);
      // Redirect to payment gateway
      window.location.href = result.paymentUrl;
    } catch (err: any) {
      setError(err?.message || 'Tạo giao dịch thất bại. Vui lòng thử lại.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <div className="relative overflow-hidden pb-4 sm:pb-6 lg:pb-8">
        <div className="relative max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-20 lg:pt-24">
          <Breadcrumb items={[{ label: 'VIP' }]} />
          <div className="text-center mb-5 sm:mb-6 lg:mb-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-500/10 rounded-full mb-3 sm:mb-4">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm sm:text-base">
                Nâng cấp VIP
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
              Trải nghiệm xem phim tốt nhất
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto">
              Chọn gói VIP phù hợp và tận hưởng hàng ngàn bộ phim chất lượng cao không giới hạn
            </p>
            {isVipActive && (
              <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-sm sm:text-base">
                <span className="text-gray-400">Hiện tại:</span>
                <VipBadge vipTier={currentVipTier} size="md" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 space-y-5 sm:space-y-6 lg:space-y-8 -mt-4">
        {/* Step 1: Choose tier */}
        <section>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 flex items-center gap-2">
            <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-red-500/20 text-red-400 text-xs sm:text-sm lg:text-base font-bold flex items-center justify-center">1</span>
            Chọn loại VIP
          </h2>
          <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
            <VipTierCard tier="VIP_FREEADS" selected={selectedTier === 'VIP_FREEADS'} onSelect={() => { setSelectedTier('VIP_FREEADS'); setSelectedPlan(null); }} />
            <VipTierCard tier="VIP_GOLD" selected={selectedTier === 'VIP_GOLD'} onSelect={() => { setSelectedTier('VIP_GOLD'); setSelectedPlan(null); }} />
          </div>
        </section>

        {/* Step 2: Choose plan */}
        <section>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 flex items-center gap-2">
            <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-red-500/20 text-red-400 text-xs sm:text-sm lg:text-base font-bold flex items-center justify-center">2</span>
            Chọn thời hạn
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <PlanSelector tier={selectedTier} selected={selectedPlan?.id ?? null} onSelect={setSelectedPlan} plans={tierPlans} />
              <div className="mt-4">
                <SavingsCalculator tier={selectedTier} plans={tierPlans} />
              </div>
            </>
          )}
        </section>

        {/* Step 3: Payment method */}
        {selectedPlan && (
          <section>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 flex items-center gap-2">
              <span className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-red-500/20 text-red-400 text-xs sm:text-sm lg:text-base font-bold flex items-center justify-center">3</span>
              Phương thức thanh toán
            </h2>
            <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
          </section>
        )}

        {/* Summary & Purchase */}
        {selectedPlan && paymentMethod && (
          <section className="sticky bottom-16 lg:bottom-4 z-30">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-lg p-3.5 sm:p-5 lg:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <div className="text-xs sm:text-sm lg:text-base text-gray-400">Gói đã chọn</div>
                  <div className="text-sm sm:text-base lg:text-xl font-bold text-white">
                    {selectedTier === 'VIP_GOLD' ? 'VIP Gold' : 'VIP FreeAds'} - {selectedPlan.label}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg lg:text-2xl font-bold text-white">{formatVNDFull(selectedPlan.price)}</div>
                  {selectedPlan.discount && (
                    <div className="text-sm text-green-400">Tiết kiệm {Math.round(selectedPlan.discount * 100)}%</div>
                  )}
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={processing}
                className="w-full py-3 sm:py-3.5 lg:py-4 text-sm sm:text-base bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg sm:rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Thanh toán {formatVNDFull(selectedPlan.price)}
                  </>
                )}
              </button>

              {error && <p className="text-sm text-red-400 text-center mt-2">{error}</p>}
            </div>
          </section>
        )}

        {/* Feature Comparison Table */}
        <section>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 lg:mb-5">So sánh các gói</h2>
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gray-800/30 overflow-hidden">
            <FeatureComparisonTable />
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 lg:mb-5">Câu hỏi thường gặp</h2>
          <div className="space-y-2 sm:space-y-3">
            {[
              {
                q: 'VIP có tự động gia hạn không?',
                a: 'Không. VIP hết hạn sẽ tự động chuyển về tài khoản thường. Bạn cần mua lại nếu muốn tiếp tục sử dụng.',
              },
              {
                q: 'Tôi có thể nâng cấp từ VIP FreeAds lên VIP Gold không?',
                a: 'Có! Khi nâng cấp, thời hạn VIP còn lại sẽ được cộng thêm vào gói mới.',
              },
              {
                q: 'Thanh toán có an toàn không?',
                a: 'Tất cả giao dịch đều được bảo mật bởi SSL 256-bit và xác minh chữ ký từ VNPay/MoMo.',
              },
              {
                q: 'Tôi có thể hoàn tiền không?',
                a: 'Trong vòng 7 ngày nếu chưa sử dụng dịch vụ VIP, bạn có thể yêu cầu hoàn tiền qua email hỗ trợ.',
              },
            ].map((item) => (
              <details key={item.q} className="group rounded-lg sm:rounded-xl border border-white/10 bg-gray-800/30">
                <summary className="cursor-pointer px-3 py-2.5 sm:px-4 sm:py-3 lg:px-5 lg:py-4 text-xs sm:text-sm lg:text-base font-medium text-white flex items-center justify-between list-none">
                  {item.q}
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform -rotate-90 group-open:rotate-90" />
                </summary>
                <div className="px-3 pb-3 sm:px-4 sm:pb-3.5 lg:px-5 lg:pb-4 text-xs sm:text-sm lg:text-base text-gray-400 border-t border-white/10 pt-3 sm:pt-3.5 lg:pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>

      <DynamicPricingPopup />
    </div>
  );
}
