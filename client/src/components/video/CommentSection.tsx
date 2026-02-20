'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle, Send, ChevronDown, ChevronUp, MoreHorizontal,
  Flag, Trash2, Edit3, Reply, ThumbsUp, Loader2
} from 'lucide-react';
import { commentsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { UserAvatar } from '@/components/common/UserAvatar';

// ─── Types ────────────────────────────────────────────────────
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: string;
    nickname: string;
    avatar?: string;
    vipTier?: 'VIP_GOLD' | 'VIP_FREEADS' | null;
  };
  repliesCount?: number;
  likesCount?: number;
  isLiked?: boolean;
}

interface CommentSectionProps {
  videoId: string;
  className?: string;
}

// ─── Main Component ───────────────────────────────────────────
export function CommentSection({ videoId, className = '' }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async (pageNum: number, append = false) => {
    const setLoadingFn = pageNum === 1 ? setLoading : setLoadingMore;
    setLoadingFn(true);
    try {
      const res = await commentsApi.byVideo(videoId, pageNum, 15);
      const items = res?.data || res?.items || res || [];
      const total = res?.pagination?.total || res?.total || 0;

      setTotalComments(total);
      setComments((prev) => append ? [...prev, ...items] : items);
      setHasMore(items.length >= 15);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoadingFn(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId && isExpanded) {
      fetchComments(1);
    }
  }, [videoId, isExpanded, fetchComments]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchComments(page + 1, true);
    }
  };

  const handleNewComment = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
    setTotalComments((c) => c + 1);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalComments((c) => Math.max(0, c - 1));
    } catch {
      // Could show error toast
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header - Expandable on mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-4 border-t border-white/5"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <h3 className="text-white font-bold text-xl">
            Bình luận {totalComments > 0 && <span className="text-gray-500 font-normal">({totalComments})</span>}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 pb-4">
          {/* Comment Input */}
          <CommentInput
            videoId={videoId}
            onSubmit={handleNewComment}
            placeholder="Viết bình luận..."
          />

          {/* Comments List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-xl">Chưa có bình luận nào</p>
              <p className="text-gray-600 text-base mt-1">Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  videoId={videoId}
                  currentUserId={user?.id}
                  onDelete={handleDeleteComment}
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-2 text-xl text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Xem thêm bình luận'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Comment Input ──────────────────────────────────────────
interface CommentInputProps {
  videoId: string;
  parentId?: string;
  onSubmit: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function CommentInput({ videoId, parentId, onSubmit, onCancel, placeholder = 'Viết bình luận...', autoFocus = false }: CommentInputProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    if (!content.trim() || submitting || !isAuthenticated) return;

    setSubmitting(true);
    try {
      const res = await commentsApi.create({
        videoId,
        content: content.trim(),
        parentId,
      });

      const newComment: Comment = {
        id: res.id || Date.now().toString(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        user: {
          id: user?.id || '',
          nickname: user?.nickname || 'Bạn',
          avatar: user?.avatar,
          vipTier: user?.vipTier ?? null,
        },
        repliesCount: 0,
        likesCount: 0,
      };

      onSubmit(newComment);
      setContent('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
        <p className="text-gray-500 text-base">Đăng nhập để bình luận</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      {/* Avatar */}
      <UserAvatar
        user={user}
        size="md"
        showBadge={true}
      />

      {/* Input */}
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-base placeholder-gray-500 resize-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
          style={{ minHeight: '44px', maxHeight: '140px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        <div className="flex items-center gap-2 mt-2 justify-end">
          {onCancel && (
            <button onClick={onCancel} className="px-3 py-1 text-sm text-gray-500 hover:text-white transition-colors">
              Hủy
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-lg font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Comment ─────────────────────────────────────────
interface CommentItemProps {
  comment: Comment;
  videoId: string;
  currentUserId?: string;
  onDelete: (id: string) => void;
  isReply?: boolean;
}

function CommentItem({ comment, videoId, currentUserId, onDelete, isReply = false }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [content, setContent] = useState(comment.content);

  const isOwner = currentUserId === comment.user.id;

  const loadReplies = async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);
    try {
      const res = await commentsApi.replies(comment.id, 1, 10);
      const items = res?.data || res?.items || res || [];
      setReplies(items);
      setShowReplies(true);
    } catch {
      // ignore
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await commentsApi.update(comment.id, { content: editContent.trim() });
      setContent(editContent.trim());
      setIsEditing(false);
    } catch {
      // ignore
    }
  };

  const handleReport = async () => {
    try {
      await commentsApi.report(comment.id);
      setShowMenu(false);
    } catch {
      // ignore
    }
  };

  const handleReply = (reply: Comment) => {
    setReplies((prev) => [...prev, reply]);
    setShowReplies(true);
    setShowReplyInput(false);
  };

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-8 lg:ml-11' : ''}`}> 
      {/* Avatar */}
      <UserAvatar
        user={comment.user}
        size="md"
        showBadge={true}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-lg font-semibold">{comment.user.nickname}</span>
          <span className="text-gray-600 text-base">{timeAgo(comment.createdAt)}</span>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <span className="text-gray-600 text-base">(đã sửa)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-lg resize-none focus:outline-none focus:border-red-500/50"
              rows={2}
            />
            <div className="flex gap-2 mt-1.5 justify-end">
              <button onClick={() => { setIsEditing(false); setEditContent(content); }} className="px-2 py-1 text-sm text-gray-500 hover:text-white">
                Hủy
              </button>
              <button
                onClick={handleEdit}
                className="px-2 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Lưu
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-xl leading-relaxed break-words">{content}</p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-1.5">
            {!isReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-base text-gray-500 hover:text-white transition-colors"
              >
                <Reply className="w-3 h-3" />
                Trả lời
              </button>
            )}

            {!isReply && (comment.repliesCount || 0) > 0 && !showReplies && (
              <button
                onClick={loadReplies}
                className="flex items-center gap-1 text-base text-blue-400 hover:text-blue-300 transition-colors"
              >
                {loadingReplies ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
                {comment.repliesCount} phản hồi
              </button>
            )}

            {/* Menu */}
            <div className="relative ml-auto">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-0.5 text-gray-600 hover:text-gray-400 transition-colors"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg py-1 w-32 shadow-xl z-50">
                    {isOwner && (
                      <button
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-lg text-gray-300 hover:bg-white/5"
                      >
                        <Edit3 className="w-3 h-3" /> Sửa
                      </button>
                    )}
                    {!isOwner && (
                      <button
                        onClick={handleReport}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-lg text-gray-300 hover:bg-white/5"
                      >
                        <Flag className="w-3 h-3" /> Báo cáo
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-3">
            <CommentInput
              videoId={videoId}
              parentId={comment.id}
              onSubmit={handleReply}
              onCancel={() => setShowReplyInput(false)}
              placeholder={`Trả lời ${comment.user.nickname}...`}
              autoFocus
            />
          </div>
        )}

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                videoId={videoId}
                currentUserId={currentUserId}
                onDelete={onDelete}
                isReply
              />
            ))}
            <button
              onClick={() => setShowReplies(false)}
              className="text-base text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ChevronUp className="w-3 h-3" /> Ẩn phản hồi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Utility ────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = (now - then) / 1000;

  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} tuần trước`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
  return `${Math.floor(diff / 31536000)} năm trước`;
}
