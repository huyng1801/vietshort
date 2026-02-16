'use client';

import { useEffect, useState, useCallback } from 'react';
import { message, Form } from 'antd';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { Genre } from '@/types';
import GenresHeader from '@/components/genres/GenresHeader';
import GenresFilters from '@/components/genres/GenresFilters';
import GenresTable from '@/components/genres/GenresTable';
import GenresModal from '@/components/genres/GenresModal';

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [form] = Form.useForm();

  const { params, setParams, total, setTotal, paginationConfig, handleTableChange } = usePagination({ defaultLimit: 20 });

  const fetchGenres = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getGenres({
        page: params.page,
        limit: params.limit,
        search: search || undefined,
        isActive: filterActive,
      });

      let list: Genre[] = [];
      let totalCount = 0;

      if (res.data) {
        if (res.data.data && Array.isArray(res.data.data)) {
          list = res.data.data;
          totalCount = res.data.pagination?.total || res.data.meta?.total || list.length;
        } else if (Array.isArray(res.data)) {
          list = res.data;
          totalCount = list.length;
        } else if (res.data.pagination || res.data.meta) {
          list = res.data.data || [];
          totalCount = res.data.pagination?.total || res.data.meta?.total || 0;
        }
      }

      setGenres(list);
      setTotal(totalCount);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải thể loại');
      setGenres([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, search, filterActive, setTotal]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Handle pagination when page becomes empty
  useEffect(() => {
    if (!loading && genres.length === 0 && params.page > 1 && total > 0) {
      // Delay to ensure it doesn't loop infinitely
      const timer = setTimeout(() => {
        setParams((prev) => ({ ...prev, page: prev.page - 1 }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [genres.length, params.page, total, loading, setParams]);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      if (editingGenre) {
        await adminAPI.updateGenre(editingGenre.id, values);
        message.success('Đã cập nhật thể loại');
      } else {
        const { isActive, ...createData } = values;
        await adminAPI.createGenre(createData);
        message.success('Đã tạo thể loại mới');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingGenre(null);
      fetchGenres();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể lưu thể loại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: Genre) => {
    try {
      await adminAPI.deleteGenre(record.id);
      message.success('Đã xóa thể loại');
      fetchGenres();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể xóa thể loại');
    }
  };

  const openEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingGenre(null);
    setModalOpen(true);
  };

  return (
    <div>
      <GenresHeader onAddClick={openCreate} />
      <GenresFilters
        search={search}
        filterActive={filterActive}
        onSearchChange={setSearch}
        onFilterChange={(v) => { setFilterActive(v); setParams((p) => ({ ...p, page: 1 })); }}
        onSearch={() => setParams((prev) => ({ ...prev, page: 1 }))}
        onReset={() => { setSearch(''); setFilterActive(undefined); setParams((p) => ({ ...p, page: 1 })); }}
      />
      <GenresTable
        genres={genres}
        loading={loading}
        pagination={paginationConfig}
        onTableChange={handleTableChange}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
      <GenresModal
        open={modalOpen}
        editingGenre={editingGenre}
        form={form}
        saving={saving}
        onCancel={() => { setModalOpen(false); setEditingGenre(null); form.resetFields(); }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
