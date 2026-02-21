'use client';

import { useEffect, useRef } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { CommentSection } from '@/components/video/CommentSection';

interface MobileCommentSheetProps {
  videoId: string;
  commentCount?: number;
  show: boolean;
  onClose: () => void;
}

export function MobileCommentSheet({ videoId, commentCount = 0, show, onClose }: MobileCommentSheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-2xl z-[60] max-h-[80vh] flex flex-col animate-slide-up-panel">
        {/* Handle bar */}
        <div className="flex items-center justify-center pt-2.5 pb-0.5">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <h3 className="text-white font-bold text-base">
              Bình luận {commentCount > 0 && <span className="text-gray-500 font-normal text-sm">({commentCount})</span>}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Comments Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <CommentSection
            videoId={videoId}
            defaultExpanded={true}
            hideToggle={true}
          />
        </div>
      </div>
    </>
  );
}
