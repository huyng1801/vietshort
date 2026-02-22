'use client';

import { useState, useCallback } from 'react';
import { Share2, Link2, Check, MessageCircle } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  slug: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export function ShareButton({ title, slug, variant = 'full', className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/watch/${slug}`
    : `/watch/${slug}`;

  const shareText = `Xem "${title}" trên VietShort`;

  const handleShare = useCallback(async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - VietShort`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to copy
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: show share menu
    setShowMenu(true);
  }, [title, shareText, shareUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    }
  }, [shareUrl]);

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleShare}
          className={`p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-blue-400 transition-colors ${className}`}
          aria-label="Chia sẽ"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </button>
        {showMenu && <ShareMenu onCopy={copyLink} onFacebook={shareToFacebook} onTwitter={shareToTwitter} onTelegram={shareToTelegram} copied={copied} onClose={() => setShowMenu(false)} />}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={`flex flex-col items-center gap-1 sm:gap-1.5 lg:gap-2 group cursor-pointer ${className}`}
        aria-label="Chia sẽ"
      >
        <div className="p-2 sm:p-3 lg:p-4 rounded-full bg-white/5 group-hover:bg-blue-500/10 transition-colors">
          <Share2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-500">Chia sẽ</span>
      </button>
      {showMenu && <ShareMenu onCopy={copyLink} onFacebook={shareToFacebook} onTwitter={shareToTwitter} onTelegram={shareToTelegram} copied={copied} onClose={() => setShowMenu(false)} />}
    </div>
  );
}

// ─── Share Menu Popup ───────────────────────────────────────
interface ShareMenuProps {
  onCopy: () => void;
  onFacebook: () => void;
  onTwitter: () => void;
  onTelegram: () => void;
  copied: boolean;
  onClose: () => void;
}

function ShareMenu({ onCopy, onFacebook, onTwitter, onTelegram, copied, onClose }: ShareMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute bottom-full mb-2 sm:mb-3 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl py-1.5 sm:py-2 w-32 sm:w-36 lg:w-44 shadow-2xl z-50">
        <p className="px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[9px] lg:text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Chia sẻ qua</p>

        <button
          onClick={onFacebook}
          className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm text-gray-300 hover:bg-white/5 transition-colors"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] sm:text-xs lg:text-sm font-bold">f</div>
          Facebook
        </button>

        <button
          onClick={onTwitter}
          className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm text-gray-300 hover:bg-white/5 transition-colors"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] sm:text-xs lg:text-sm font-bold">𝕏</div>
          Twitter / X
        </button>

        <button
          onClick={onTelegram}
          className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm text-gray-300 hover:bg-white/5 transition-colors"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full bg-sky-400 flex items-center justify-center">
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          Telegram
        </button>

        <div className="border-t border-white/5 mt-0.5 sm:mt-1 pt-0.5 sm:pt-1">
          <button
            onClick={onCopy}
            className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm text-gray-300 hover:bg-white/5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-400" /> : <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            {copied ? 'Đã sao chép!' : 'Sao chép liên kết'}
          </button>
        </div>
      </div>
    </>
  );
}
