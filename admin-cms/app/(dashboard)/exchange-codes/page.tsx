'use client';

import { useEffect, useState, useCallback } from 'react';
import { Typography, Button, Space, message, Tabs, Input, Modal, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import CodeBatchTable from '@/components/exchange-codes/CodeBatchTable';
import CodeBatchForm from '@/components/exchange-codes/CodeBatchForm';
import ExchangeCodesTable from '@/components/exchange-codes/ExchangeCodesTable';
import ExchangeCodeForm from '@/components/exchange-codes/ExchangeCodeForm';
import adminAPI from '@/lib/admin-api';
import { usePagination } from '@/hooks/usePagination';
import type { ExchangeCode, CodeBatch } from '@/types/admin';

const { Title } = Typography;
const { Search } = Input;

export default function ExchangeCodesPage() {
  const router = useRouter();

  // ==================== Batch State ====================
  const [batches, setBatches] = useState<CodeBatch[]>([]);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const {
    params: batchParams,
    handleTableChange: handleBatchTableChange,
    paginationConfig: batchPaginationConfig,
  } = usePagination();

  // ==================== Codes State ====================
  const [codes, setCodes] = useState<ExchangeCode[]>([]);
  const [codesTotal, setCodesTotal] = useState(0);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    params: codeParams,
    setParams: setCodeParams,
    handleTableChange: handleCodeTableChange,
    paginationConfig: codePaginationConfig,
  } = usePagination();

  // ==================== Fetch Batches ====================
  const fetchBatches = useCallback(async () => {
    setBatchLoading(true);
    try {
      const res = await adminAPI.getCodeBatches({
        page: batchParams.page,
        limit: batchParams.limit,
      });
      if (res.data?.data) {
        setBatches(res.data.data);
        setBatchTotal(res.data.pagination?.total || res.data.data.length);
      } else if (Array.isArray(res.data)) {
        setBatches(res.data);
        setBatchTotal(res.data.length);
      } else {
        setBatches([]);
        setBatchTotal(0);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách lô mã');
      setBatches([]);
    } finally {
      setBatchLoading(false);
    }
  }, [batchParams]);

  // ==================== Fetch Individual Codes ====================
  const fetchCodes = useCallback(async () => {
    setCodesLoading(true);
    try {
      const res = await adminAPI.getExchangeCodes({
        page: codeParams.page,
        limit: codeParams.limit,
        search: searchTerm || undefined,
      });
      if (res.data?.data) {
        setCodes(res.data.data);
        setCodesTotal(res.data.pagination?.total || res.data.data.length);
      } else if (Array.isArray(res.data)) {
        setCodes(res.data);
        setCodesTotal(res.data.length);
      } else {
        setCodes([]);
        setCodesTotal(0);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải danh sách mã');
      setCodes([]);
    } finally {
      setCodesLoading(false);
    }
  }, [codeParams, searchTerm]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);
  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  // ==================== Batch Actions ====================
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

  // ==================== Code Actions ====================
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCodeParams((prev) => ({ ...prev, page: 1 }));
  };

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
      <div className="page-header">
        <Title level={3}>Quản lý mã đổi quà</Title>
      </div>

      <Tabs
        defaultActiveKey="batches"
        items={[
          {
            key: 'batches',
            label: '📦 Lô mã',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <Tooltip title="Làm mới">
                      <Button icon={<ReloadOutlined />} onClick={fetchBatches} />
                    </Tooltip>
                    <Tooltip title="Tạo lô mã mới">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setBatchModalOpen(true)}
                      />
                    </Tooltip>
                  </Space>
                </div>

                <CodeBatchTable
                  data={batches}
                  loading={batchLoading}
                  pagination={{ ...batchPaginationConfig, total: batchTotal, showTotal: (t: number) => `Tổng ${t} lô mã` }}
                  onChange={handleBatchTableChange}
                  onView={handleViewBatch}
                  onDeactivate={handleDeactivateBatch}
                  onExport={handleExportBatch}
                />
              </>
            ),
          },
          {
            key: 'codes',
            label: '🔑 Tất cả mã',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <Search
                      placeholder="Tìm kiếm mã..."
                      prefix={<SearchOutlined />}
                      onSearch={handleSearch}
                      onChange={(e) => !e.target.value && handleSearch('')}
                      style={{ width: 280 }}
                      allowClear
                    />
                    <Button icon={<ReloadOutlined />} onClick={fetchCodes}>
                      Làm mới
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCodeModalOpen(true)}
                    >
                      Tạo mã đơn lẻ
                    </Button>
                  </Space>
                </div>

                <ExchangeCodesTable
                  codes={codes}
                  loading={codesLoading}
                  pagination={{ ...codePaginationConfig, total: codesTotal, showTotal: (t: number) => `Tổng ${t} mã` }}
                  onChange={handleCodeTableChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </>
            ),
          },
        ]}
      />

      {/* Modal tạo lô mã */}
      <Modal
        title="Tạo lô mã mới"
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <CodeBatchForm
          onSuccess={() => {
            setBatchModalOpen(false);
            fetchBatches();
          }}
        />
      </Modal>

      {/* Modal tạo mã đơn lẻ */}
      <Modal
        title="Tạo mã đổi quà đơn lẻ"
        open={codeModalOpen}
        onCancel={() => setCodeModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <ExchangeCodeForm
          onSuccess={() => {
            setCodeModalOpen(false);
            fetchCodes();
          }}
        />
      </Modal>
    </div>
  );
}
