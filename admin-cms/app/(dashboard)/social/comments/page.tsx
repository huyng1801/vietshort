'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { Comment, CommentStats } from '@/types';
import CommentsHeader from '@/components/social/comments/CommentsHeader';
import CommentsFilters from '@/components/social/comments/CommentsFilters';
import CommentsBulkActions from '@/components/social/comments/CommentsBulkActions';
import CommentsTable from '@/components/social/comments/CommentsTable';

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [search, setSearch] = useState('');
  const [filterApproved, setFilterApproved] = useState<string | undefined>(undefined);
  const [filterReported, setFilterReported] = useState<string | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getComments({
        page: params.page,
        limit: params.limit,
        search: search || undefined,
        isApproved: filterApproved,
        isReported: filterReported,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const result = res.data?.data || res.data;
      setComments(Array.isArray(result) ? result : result?.data || []);
      setTotal(res.data?.pagination?.total || res.data?.total || 0);
    } catch {
      message.error('Không thể tải danh sách bình luận');
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, search, filterApproved, filterReported, setTotal]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getCommentStats();
      setStats(res.data?.data || res.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchComments(); }, [fetchComments]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleModerate = async (id: string, isApproved: boolean) => {
    try {
      await adminAPI.moderateComment(id, isApproved);
      message.success(isApproved ? 'Đã duyệt bình luận' : 'Đã ẩn bình luận');
      fetchComments();
      fetchStats();
    } catch {
      message.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteComment(id);
      message.success('Đã xóa bình luận');
      fetchComments();
      fetchStats();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleBulkModerate = async (isApproved: boolean) => {
    if (!selectedRowKeys.length) return;
    try {
      await adminAPI.bulkModerateComments(selectedRowKeys, isApproved);
      message.success(`Đã ${isApproved ? 'duyệt' : 'ẩn'} ${selectedRowKeys.length} bình luận`);
      setSelectedRowKeys([]);
      fetchComments();
      fetchStats();
    } catch {
      message.error('Thao tác hàng loạt thất bại');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedRowKeys.length) return;
    try {
      await adminAPI.bulkDeleteComments(selectedRowKeys);
      message.success(`Đã xóa ${selectedRowKeys.length} bình luận`);
      setSelectedRowKeys([]);
      fetchComments();
      fetchStats();
    } catch {
      message.error('Xóa hàng loạt thất bại');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý bình luận</h1>

      <CommentsHeader stats={stats} loading={loading} />

      <CommentsFilters
        search={search}
        filterApproved={filterApproved}
        filterReported={filterReported}
        onSearchChange={setSearch}
        onApprovedChange={(v) => { setFilterApproved(v); setParams((p) => ({ ...p, page: 1 })); }}
        onReportedChange={(v) => { setFilterReported(v); setParams((p) => ({ ...p, page: 1 })); }}
        onSearch={() => { fetchComments(); fetchStats(); }}
        onReset={() => { setSearch(''); setFilterApproved(undefined); setFilterReported(undefined); setParams((p) => ({ ...p, page: 1 })); }}
      />

      <CommentsBulkActions
        selectedCount={selectedRowKeys.length}
        onApproveAll={() => handleBulkModerate(true)}
        onHideAll={() => handleBulkModerate(false)}
        onDeleteAll={handleBulkDelete}
      />

      <CommentsTable
        comments={comments}
        loading={loading}
        pagination={paginationConfig}
        selectedRowKeys={selectedRowKeys}
        onTableChange={handleTableChange}
        onSelectionChange={setSelectedRowKeys}
        onModerate={handleModerate}
        onDelete={handleDelete}
      />
    </div>
  );
}
