'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import BannersHeader from '@/components/banners/BannersHeader';
import BannersFilters from '@/components/banners/BannersFilters';
import BannerTable from '@/components/banners/BannerTable';
import BannerFormModal from '@/components/banners/BannerFormModal';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { Banner } from '@/types/admin';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const { params, setParams, total, setTotal, handleTableChange } = usePagination({ defaultLimit: 20 });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBanners({
        page: params.page,
        limit: params.limit,
        search: search?.trim() || undefined,
        isActive: filterActive,
      });

      const bannersData = res.data?.data || [];
      const totalCount = res.data?.pagination?.total || 0;

      setBanners(bannersData);
      setTotal(totalCount);

      if (bannersData.length === 0 && (search || filterActive !== undefined)) {
        message.info('Không tìm thấy banner nào với bộ lọc hiện tại');
      }
    } catch (err: any) {
      console.error('Fetch banners error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách banner';
      message.error(errorMessage);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, search, filterActive, setTotal]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  // Auto-navigate to previous page if current page becomes empty
  useEffect(() => {
    if (!loading && banners.length === 0 && params.page > 1) {
      setParams((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [banners.length, loading, params.page, setParams]);

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setSearch('');
    setFilterActive(undefined);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (value: boolean | undefined) => {
    setFilterActive(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingBanner(null);
  };

  const handleModalSuccess = () => {
    fetchBanners();
  };

  const paginationConfig = {
    current: params.page,
    pageSize: params.limit,
    total,
    showQuickJumper: true,
    showTotal: (t: number) => `Tổng ${t} mục`,
  };

  return (
    <div>
      <BannersHeader onAdd={handleAdd} />
      <BannersFilters
        search={search}
        filterActive={filterActive}
        onSearchChange={setSearch}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />
      <BannerTable
        banners={banners}
        loading={loading}
        pagination={paginationConfig}
        onChange={handleTableChange}
        onRefresh={fetchBanners}
        onEdit={handleEdit}
      />
      <BannerFormModal
        open={modalOpen}
        banner={editingBanner}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
