'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Space, message, Modal, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import CodeBatchTable from '@/components/exchange-codes/CodeBatchTable';
import CodeBatchForm from '@/components/exchange-codes/CodeBatchForm';
import FilterBar, { FilterField } from '@/components/common/FilterBar';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import { useFilters } from '@/hooks/useFilters';
import type { CodeBatch } from '@/types';

const filterFields: FilterField[] = [
  {
    key: 'search',
    label: 'Tìm kiếm',
    type: 'search',
    placeholder: 'Tên lô mã, prefix...',
    width: 280,
  },
  {
    key: 'isActive',
    label: 'Trạng thái',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Hoạt động', value: 'true' },
      { label: 'Đã vô hiệu hóa', value: 'false' },
    ],
  },
  {
    key: 'rewardType',
    label: 'Loại phần thưởng',
    type: 'select',
    options: [
      { label: 'Tất cả', value: '' },
      { label: '🪙 Xu vàng', value: 'GOLD' },
      { label: '👑 VIP Days', value: 'VIP' },
    ],
  },
  {
    key: 'dateRange',
    label: 'Ngày tạo',
    type: 'dateRange',
  },
];

const defaultFilters = {
  search: '',
  isActive: '',
  rewardType: '',
  dateRange: [] as any[],
};

export default function CodeBatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<CodeBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const {
    params,
    total,
    setTotal,
    handleTableChange,
    paginationConfig,
  } = usePagination();
  const { filters, updateFilter, resetFilters } = useFilters(defaultFilters);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, any> = {
        page: params.page,
        limit: params.limit,
      };
      if (filters.search && filters.search.trim()) {
        apiParams.search = filters.search;
      }
      if (filters.isActive && filters.isActive !== '') {
        apiParams.isActive = filters.isActive;
      }
      if (filters.rewardType && filters.rewardType !== '') {
        apiParams.rewardType = filters.rewardType;
      }
      if (filters.dateRange && filters.dateRange.length === 2) {
        apiParams.dateFrom = filters.dateRange[0];
        apiParams.dateTo = filters.dateRange[1];
      }

      const res = await adminAPI.getCodeBatches(apiParams);
      if (res.data?.data) {
        setBatches(res.data.data);
        setTotal(res.data.pagination?.total || res.data.data.length);
      } else if (Array.isArray(res.data)) {
        setBatches(res.data);
        setTotal(res.data.length);
      } else {
        setBatches([]);
        setTotal(0);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách lô mã');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [params, filters, setTotal]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleViewBatch = (id: string) => {
    router.push(`/exchange-codes/${id}`);
  };

  const handleDeactivateBatch = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận vô hiệu hóa lô mã',
      content: 'Tất cả mã trong lô này sẽ bị vô hiệu hóa. Hành động không thể hoàn tác.',
      okText: 'Vô hiệu hóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await adminAPI.deactivateCodeBatch(id);
          message.success('Đã vô hiệu hóa lô mã');
          fetchBatches();
        } catch (err: any) {
          message.error(err?.response?.data?.message || 'Không thể vô hiệu hóa lô mã');
        }
      },
    });
  };

  const handleExportBatch = async (id: string, batchName: string) => {
    try {
      const res = await adminAPI.exportCodes(id);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codes_${batchName.replace(/\s+/g, '_')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Đã xuất file Excel thành công');
    } catch {
      message.error('Xuất file thất bại');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold m-0">Lô mã đổi quà</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchBatches}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Tạo lô mã mới
          </Button>
        </Space>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      <CodeBatchTable
        data={batches}
        loading={loading}
        pagination={{ ...paginationConfig, total }}
        onChange={handleTableChange}
        onView={handleViewBatch}
        onDeactivate={handleDeactivateBatch}
        onExport={handleExportBatch}
      />

      <Modal
        title="Tạo lô mã mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
        destroyOnHidden
        maskClosable
      >
        <CodeBatchForm
          onSuccess={() => {
            setModalOpen(false);
            fetchBatches();
          }}
        />
      </Modal>
    </div>
  );
}
