'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, Button, Space, message } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  AppstoreOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import AdsConfigForm from './AdsConfigForm';
import AdPlacementsFilters from './AdPlacementsFilters';
import AdPlacementsTable from './AdPlacementsTable';
import AdPlacementFormModal from './AdPlacementFormModal';
import AdsRevenueStats from './AdsRevenueStats';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { AdPlacement, AdPlacementType, AdStatus } from '@/types';

export default function AdsSettingsTab() {
  // ── Placements state ────────────────────────
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [placementsLoading, setPlacementsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<AdPlacementType | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<AdStatus | undefined>(undefined);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);

  const { params, setParams, total, setTotal, handleTableChange } = usePagination({ defaultLimit: 20 });

  // ── Fetch placements ───────────────────────
  const fetchPlacements = useCallback(async () => {
    setPlacementsLoading(true);
    try {
      const res = await adminAPI.getAdPlacements({
        page: params.page,
        limit: params.limit,
        search: search?.trim() || undefined,
        type: filterType,
        status: filterStatus,
        isActive: filterActive,
      });

      const data = res.data?.data || [];
      const totalCount = res.data?.pagination?.total || res.data?.total || 0;

      setPlacements(data);
      setTotal(totalCount);
    } catch (err: any) {
      console.error('Fetch ad placements error:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tải danh sách vị trí QC';
      message.error(errorMessage);
      setPlacements([]);
    } finally {
      setPlacementsLoading(false);
    }
  }, [params.page, params.limit, search, filterType, filterStatus, filterActive, setTotal]);

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  // Auto-navigate to previous page if current page becomes empty
  useEffect(() => {
    if (!placementsLoading && placements.length === 0 && params.page > 1) {
      setParams((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [placements.length, placementsLoading, params.page, setParams]);

  // ── Filter handlers ────────────────────────
  const handleSearch = () => setParams((prev) => ({ ...prev, page: 1 }));

  const handleReset = () => {
    setSearch('');
    setFilterType(undefined);
    setFilterStatus(undefined);
    setFilterActive(undefined);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleTypeChange = (value: AdPlacementType | undefined) => {
    setFilterType(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (value: AdStatus | undefined) => {
    setFilterStatus(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleActiveChange = (value: boolean | undefined) => {
    setFilterActive(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  // ── Modal handlers ─────────────────────────
  const handleAdd = () => {
    setEditingPlacement(null);
    setModalOpen(true);
  };

  const handleEdit = (placement: AdPlacement) => {
    setEditingPlacement(placement);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingPlacement(null);
  };

  const handleModalSuccess = () => {
    fetchPlacements();
  };

  const paginationConfig = {
    current: params.page,
    pageSize: params.limit,
    total,
    showQuickJumper: true,
    showTotal: (t: number) => `Tổng ${t} vị trí QC`,
  };

  return (
    <Tabs
      defaultActiveKey="placements"
      type="card"
      items={[
        {
          key: 'placements',
          label: (
            <span>
              <AppstoreOutlined /> Vị trí quảng cáo
            </span>
          ),
          children: (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold m-0">Quản lý vị trí quảng cáo</h2>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={fetchPlacements} loading={placementsLoading}>
                    Làm mới
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm vị trí QC
                  </Button>
                </Space>
              </div>

              {/* Filters */}
              <AdPlacementsFilters
                search={search}
                filterType={filterType}
                filterStatus={filterStatus}
                filterActive={filterActive}
                onSearchChange={setSearch}
                onTypeChange={handleTypeChange}
                onStatusChange={handleStatusChange}
                onActiveChange={handleActiveChange}
                onSearch={handleSearch}
                onReset={handleReset}
              />

              {/* Table */}
              <AdPlacementsTable
                placements={placements}
                loading={placementsLoading}
                pagination={paginationConfig}
                onChange={handleTableChange}
                onRefresh={fetchPlacements}
                onEdit={handleEdit}
              />

              {/* Create/Edit Modal */}
              <AdPlacementFormModal
                open={modalOpen}
                placement={editingPlacement}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
              />
            </div>
          ),
        },
        {
          key: 'config',
          label: (
            <span>
              <SettingOutlined /> Cấu hình chung
            </span>
          ),
          children: <AdsConfigForm />,
        },
        {
          key: 'revenue',
          label: (
            <span>
              <DollarOutlined /> Doanh thu QC
            </span>
          ),
          children: <AdsRevenueStats />,
        },
      ]}
    />
  );
}
