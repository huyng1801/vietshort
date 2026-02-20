'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import CodeBatchTable from '@/components/exchange-codes/CodeBatchTable';
import CodeBatchFilters from '@/components/exchange-codes/CodeBatchFilters';
import CodeBatchForm from '@/components/exchange-codes/CodeBatchForm';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { CodeBatch } from '@/types';
import type { Dayjs } from 'dayjs';
import type { CodeBatchFormHandle } from '@/components/exchange-codes/CodeBatchForm';

export default function ExchangeCodesPage() {
  const router = useRouter();
  const formRef = useRef<CodeBatchFormHandle>(null);
  const [batches, setBatches] = useState<CodeBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<string | undefined>();
  const [rewardType, setRewardType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const {
    params,
    total,
    setTotal,
    handleTableChange,
    paginationConfig,
  } = usePagination();

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, any> = {
        page: params.page,
        limit: params.limit,
      };
      if (search && search.trim()) {
        apiParams.search = search;
      }
      if (isActive && isActive !== '') {
        apiParams.isActive = isActive;
      }
      if (rewardType && rewardType !== '') {
        apiParams.rewardType = rewardType;
      }
      if (dateRange && dateRange.length === 2) {
        // Convert Dayjs objects to ISO date strings (YYYY-MM-DD)
        apiParams.dateFrom = dateRange[0].toISOString().split('T')[0];
        apiParams.dateTo = dateRange[1].toISOString().split('T')[0];
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
  }, [params, search, isActive, rewardType, dateRange, setTotal]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleViewBatch = (id: string) => {
    router.push(`/exchange-codes/${id}`);
  };

  const handleDeactivateBatch = () => {
    fetchBatches();
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

  const handleFormSubmit = async () => {
    try {
      setSubmitting(true);
      await formRef.current?.handleSubmit();
      setModalOpen(false);
      fetchBatches();
    } catch (err) {
      // Error is already handled by the form
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold m-0">Lô mã đổi quà</h1>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Tạo lô mã mới
          </Button>
        </Space>
      </div>

      <CodeBatchFilters
        search={search}
        isActive={isActive}
        rewardType={rewardType}
        dateRange={dateRange}
        onSearchChange={setSearch}
        onIsActiveChange={setIsActive}
        onRewardTypeChange={setRewardType}
        onDateRangeChange={setDateRange}
        onSearch={fetchBatches}
        onReset={() => {
          setSearch('');
          setIsActive(undefined);
          setRewardType(undefined);
          setDateRange(null);
        }}
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
        onOk={handleFormSubmit}
        okText="Tạo mã"
        cancelText="Hủy"
        confirmLoading={submitting}
        width={680}
        destroyOnHidden
        maskClosable={!submitting}
        centered
      >
        <CodeBatchForm
          ref={formRef}
          onSuccess={() => {
            setModalOpen(false);
            fetchBatches();
          }}
        />
      </Modal>
    </div>
  );
}
