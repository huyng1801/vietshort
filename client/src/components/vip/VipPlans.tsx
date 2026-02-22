'use client';


import { Crown, Zap, Shield, Sparkles, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VipTierCardProps {
  tier: 'VIP_FREEADS' | 'VIP_GOLD';
  selected: boolean;
  onSelect: () => void;
}

const TIER_INFO = {
  VIP_FREEADS: {
    name: 'VIP FreeAds',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/20',
    bg: 'bg-blue-500/10',
    tagline: 'Trải nghiệm không quảng cáo',
    features: [
      { label: 'Xem phim không quảng cáo', included: true },
      { label: 'Chất lượng tối đa 720p', included: true },
      { label: 'Chất lượng 1080p', included: false },
      { label: 'Phim độc quyền VIP', included: false },
      { label: 'Ưu tiên hỗ trợ', included: false },
    ],
  },
  VIP_GOLD: {
    name: 'VIP Gold',
    icon: Crown,
    color: 'from-amber-500 to-yellow-500',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/20',
    bg: 'bg-amber-500/10',
    tagline: 'Trải nghiệm cao cấp nhất',
    features: [
      { label: 'Xem phim không quảng cáo', included: true },
      { label: 'Chất lượng tối đa 720p', included: true },
      { label: 'Chất lượng 1080p', included: true },
      { label: 'Phim độc quyền VIP', included: true },
      { label: 'Ưu tiên hỗ trợ', included: true },
    ],
  },
};

export function VipTierCard({ tier, selected, onSelect }: VipTierCardProps) {
  const info = TIER_INFO[tier];
  const Icon = info.icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex-1 rounded-xl sm:rounded-2xl border-2 p-4 sm:p-5 lg:p-6 text-left transition-all duration-300',
        selected
          ? `${info.border} ${info.glow} shadow-lg scale-[1.02]`
          : 'border-white/10 hover:border-gray-600',
      )}
    >
      {tier === 'VIP_GOLD' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full text-xs font-bold text-black">
          Phổ biến nhất
        </div>
      )}

      <div className={cn('inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm lg:text-base font-semibold mb-3 sm:mb-4', info.bg)}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        {info.name}
      </div>

      <p className="text-gray-400 text-xs sm:text-sm lg:text-base mb-3 sm:mb-4">{info.tagline}</p>

      <ul className="space-y-1.5 sm:space-y-2 lg:space-y-2.5">
        {info.features.map((f) => (
          <li key={f.label} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
            {f.included ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
            )}
            <span className={f.included ? 'text-gray-200' : 'text-gray-500'}>{f.label}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

// ─── Pricing Plans ────────────────────────────────────────────

export interface PlanOption {
  id: string;
  type?: 'VIP_FREEADS' | 'VIP_GOLD';
  days: number;
  price: number;
  goldPrice: number;
  discount: number | null;
  label: string;
  perMonth: number;
}

interface PlanSelectorProps {
  tier: 'VIP_FREEADS' | 'VIP_GOLD';
  selected: string | null;
  onSelect: (plan: PlanOption) => void;
  plans: PlanOption[];
}

export function PlanSelector({ tier, selected, onSelect, plans }: PlanSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
      {plans.map((plan) => {
        const isSelected = selected === plan.id;
        const originalPrice = plan.discount ? Math.round(plan.price / (1 - plan.discount)) : null;
        return (
          <button
            key={plan.id}
            onClick={() => onSelect(plan)}
            className={cn(
              'relative rounded-lg sm:rounded-xl border-2 p-3.5 sm:p-4 lg:p-5 text-center transition-all',
              isSelected
                ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                : 'border-white/10 hover:border-gray-500 bg-gray-800/50',
            )}
          >
            {plan.discount && (
              <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-red-500 rounded-full text-[10px] font-bold">
                -{Math.round(plan.discount * 100)}%
              </div>
            )}
            <div className="text-xs sm:text-sm lg:text-base text-gray-400 mb-1.5 sm:mb-2">{plan.label}</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              {formatVND(plan.price)}
            </div>
            {originalPrice && (
              <div className="text-xs sm:text-sm text-gray-500 line-through mt-0.5 sm:mt-1">
                {formatVND(originalPrice)}
              </div>
            )}
            <div className="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2">
              ~{formatVND(plan.perMonth)}/tháng
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Savings Calculator ───────────────────────────────────────

interface SavingsCalculatorProps {
  tier: 'VIP_FREEADS' | 'VIP_GOLD';
  plans: PlanOption[];
}

export function SavingsCalculator({ tier, plans }: SavingsCalculatorProps) {
  if (!plans || plans.length < 3) return null;

  const monthly = plans[0];
  const yearly = plans[2];

  const monthlyCostYear = monthly.price * 12;
  const savings = monthlyCostYear - yearly.price;
  const savingsPercent = Math.round((savings / monthlyCostYear) * 100);

  return (
    <div className="rounded-lg sm:rounded-xl border border-green-500/30 bg-green-500/5 p-3.5 sm:p-4 lg:p-5">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
        <span className="text-xs sm:text-sm lg:text-base font-semibold text-green-400">Tiết kiệm với gói năm</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm lg:text-base">
        <div>
          <div className="text-gray-400">Thanh toán hàng tháng (12 tháng)</div>
          <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-300 line-through">{formatVND(monthlyCostYear)}</div>
        </div>
        <div>
          <div className="text-gray-400">Gói 1 năm</div>
          <div className="text-base sm:text-lg lg:text-xl font-bold text-white">{formatVND(yearly.price)}</div>
        </div>
      </div>
      <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-green-400 font-semibold text-xs sm:text-sm lg:text-base">
        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
        Tiết kiệm {formatVND(savings)} ({savingsPercent}%)
      </div>
    </div>
  );
}

// ─── Feature Comparison Table ─────────────────────────────────

export function FeatureComparisonTable() {
  const features = [
    { name: 'Xem phim miễn phí', free: true, freeads: true, gold: true },
    { name: 'Quảng cáo', free: 'Có', freeads: 'Không', gold: 'Không' },
    { name: 'Chất lượng tối đa', free: '540p', freeads: '720p', gold: '1080p' },
    { name: 'Phim độc quyền VIP', free: false, freeads: false, gold: true },
    { name: 'Ưu tiên hỗ trợ', free: false, freeads: false, gold: true },
    { name: 'Đánh giá phim', free: false, freeads: true, gold: true },
    { name: 'Huy hiệu VIP', free: false, freeads: true, gold: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm lg:text-base">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-2.5 px-3 sm:py-3 sm:px-4 lg:py-4 lg:px-5 text-gray-400 font-medium">Tính năng</th>
            <th className="text-center py-2.5 px-3 sm:py-3 sm:px-4 lg:py-4 lg:px-5 text-gray-400 font-medium">Miễn phí</th>
            <th className="text-center py-2.5 px-3 sm:py-3 sm:px-4 lg:py-4 lg:px-5 text-blue-400 font-medium">VIP FreeAds</th>
            <th className="text-center py-2.5 px-3 sm:py-3 sm:px-4 lg:py-4 lg:px-5 text-amber-400 font-medium">VIP Gold</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f) => (
            <tr key={f.name} className="border-b border-gray-800">
              <td className="py-2.5 px-3 sm:py-3 sm:px-4 lg:py-4 lg:px-5 text-gray-300">{f.name}</td>
              <td className="py-2.5 px-3 sm:py-3 sm:px-4 lg:py-4 lg:px-5 text-center">{renderCell(f.free)}</td>
              <td className="py-2.5 px-3 sm:py-3 sm:px-4 lg:py-4 lg:px-5 text-center">{renderCell(f.freeads)}</td>
              <td className="py-2.5 px-3 sm:py-3 sm:px-4 lg:py-4 lg:px-5 text-center">{renderCell(f.gold)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(value: boolean | string) {
  if (value === true) return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-gray-600 mx-auto" />;
  return <span className="text-gray-300">{value}</span>;
}

// ─── Helpers ──────────────────────────────────────────────────

export function formatVND(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
  return `${amount}đ`;
}

export function formatVNDFull(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}
