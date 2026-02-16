'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import ExchangeCodesTable from '@/components/exchange-codes/ExchangeCodesTable';
import ExchangeCodeForm from '@/components/exchange-codes/ExchangeCodeForm';
import FilterBar, { FilterField } from '@/components/common/FilterBar';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import { useFilters } from '@/hooks/useFilters';
import type { ExchangeCode } from '@/types';

const filterFields: FilterField[] = [
  {
    key: 'search',
    label: 'Tìm kiếm',
    type: 'search',
    placeholder: 'Tìm kiếm mã...',
    width: 280,
  },
];

const defaultFilters = {
  search: '',
};

export default function ExchangeCodesPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<ExchangeCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const {
    params,
    setParams,
    total,
    setTotal,
    handleTableChange,
    paginationConfig,
  } = usePagination();
  const { filters, updateFilter, resetFilters } = useFilters(defaultFilters);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getExchangeCodes({
        page: params.page,
        limit: params.limit,
        search: filters.search || undefined,
      });
      if (res.data?.data) {
        setCodes(res.data.data);
        setTotal(res.data.pagination?.total || res.data.data.length);
      } else if (Array.isArray(res.data)) {
        setCodes(res.data);
        setTotal(res.data.length);
      } else {
        setCodes([]);
        setTotal(0);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách mã');
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, [params, filters, setTotal]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleEdit = (id: string) => {
    router.push(`/exchange-codes/${id}`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa mã này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        message.warning('Chức năng xóa mã đơn lẻ chưa được hỗ trợ');
      },
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold m-0">Mã đổi quà</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCodes}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Tạo mã đơn lẻ
          </Button>
        </Space>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      <ExchangeCodesTable
        codes={codes}
        loading={loading}
        pagination={{ ...paginationConfig, total }}
        onChange={handleTableChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        title="Tạo mã đổi quà đơn lẻ"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
        destroyOnHidden
        maskClosable
      >
        <ExchangeCodeForm
          onSuccess={() => {
            setModalOpen(false);
            fetchCodes();
          }}
        />
      </Modal>
    </div>
  );
}
