'use client';

import { useState } from 'react';
import { CreditCard, QrCode, Wallet, ChevronRight, Shield, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'VNPAY' | 'MOMO';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const METHODS = [
  {
    id: 'VNPAY' as PaymentMethod,
    name: 'VNPay',
    description: 'Thẻ nội địa, QR code, Internet Banking',
    icon: '🏦',
    color: 'from-blue-600 to-blue-800',
    border: 'border-blue-500/50',
    features: ['Thẻ ATM / Internet Banking', 'QR Code', 'Ví VNPay'],
  },
  {
    id: 'MOMO' as PaymentMethod,
    name: 'MoMo',
    description: 'Ví điện tử MoMo, QR code',
    icon: '💜',
    color: 'from-pink-600 to-purple-700',
    border: 'border-pink-500/50',
    features: ['Ví MoMo', 'QR Code', 'Liên kết ngân hàng'],
  },
];

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {METHODS.map((m) => {
        const isSelected = selected === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={cn(
              'w-full flex items-center gap-4 rounded-xl border-2 p-5 transition-all text-left',
              isSelected
                ? `${m.border} bg-gray-800/80 shadow-lg`
                : 'border-white/10 hover:border-gray-500 bg-gray-800/30',
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br',
              m.color,
            )}>
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-base">{m.name}</div>
              <div className="text-sm text-gray-400 mt-0.5">{m.description}</div>
              {isSelected && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.features.map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-300">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              isSelected ? 'border-red-500 bg-red-500' : 'border-gray-600',
            )}>
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        );
      })}
      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
        <Lock className="w-4 h-4" />
        <span>Thanh toán được bảo mật bởi SSL 256-bit encryption</span>
      </div>
    </div>
  );
}
