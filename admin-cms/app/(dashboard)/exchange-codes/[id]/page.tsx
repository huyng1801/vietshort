'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Spin,
  message,
  Button,
  Card,
  Descriptions,
  Tag,
  Progress,
  Space,
  Table,
  Tabs,
  Modal,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, StopOutlined } from '@ant-design/icons';
import CodeRedemptionTable from '@/components/exchange-codes/CodeRedemptionTable';
import adminAPI from '@/lib/admin-api';
import { formatDate } from '@/lib/admin-utils';
import type { CodeBatch, ExchangeCode } from '@/types';

const { Title } = Typography;

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<CodeBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const batchId = params.id as string;

  const fetchBatch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCodeBatch(batchId);
      setBatch(res.data);
    } catch (err: any) {
      console.error('Fetch batch error:', err);
      message.error('Không thể tải thông tin lô mã');
      router.push('/exchange-codes');
    } finally {
      setLoading(false);
    }
  }, [batchId, router]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  const handleExport = async () => {
    if (!batch) return;
    try {
      const res = await adminAPI.exportCodes(batchId);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codes_${(batch.batchName ?? batch.name ?? '').replace(/\s+/g, '_')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Đã tải file Excel');
    } catch {
      message.error('Xuất file thất bại');
    }
  };

 

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!batch) return null;

  const isExpired = batch.expiresAt && new Date(batch.expiresAt) < new Date();

  const codeColumns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (code: string) => (
        <Typography.Text code copyable>
          {code}
        </Typography.Text>
      ),
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      width: 120,
      render: (_: unknown, record: ExchangeCode) => (
        <span>
          {record.usedCount}/{record.usageLimit}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean, record: ExchangeCode) => {
        if (!active) return <Tag color="red">Tắt</Tag>;
        if (record.usedCount >= (record.usageLimit ?? record.maxUses ?? 0)) return <Tag color="volcano">Hết lượt</Tag>;
        return <Tag color="green">Hoạt động</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (d: string) => formatDate(d),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/exchange-codes')}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ marginBottom: 0 }}>
            {batch.batchName}
          </Title>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Xuất Excel
            </Button>
           
          </Space>
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên lô mã">
            <span style={{ fontWeight: 'bold', fontSize: 16 }}>{batch.batchName}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {!batch.isActive ? (
              <Tag color="red">Đã vô hiệu hóa</Tag>
            ) : isExpired ? (
              <Tag color="orange">Hết hạn</Tag>
            ) : (
              <Tag color="green">Hoạt động</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Loại phần thưởng">
            <Tag color={batch.rewardType === 'GOLD' ? 'gold' : 'purple'}>
              {batch.rewardType === 'GOLD' ? '🪙 Xu vàng' : '👑 VIP Days'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Giá trị">
            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
              {batch.rewardType === 'GOLD'
                ? `${(batch.rewardValue ?? 0).toLocaleString()} xu`
                : `${batch.rewardValue ?? 0} ngày`}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng số mã">{batch.totalCodes}</Descriptions.Item>
          <Descriptions.Item label="Đã dùng / Còn lại">
            <span style={{ color: '#cf1322' }}>{batch.usedCodes}</span> /{' '}
            <span style={{ color: '#3f8600' }}>{batch.remainingCodes}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Giới hạn sử dụng / mã">
            {batch.usageLimit || 1} lần
          </Descriptions.Item>
          <Descriptions.Item label="Độ dài mã">{batch.codeLength} ký tự</Descriptions.Item>

          <Descriptions.Item label="Prefix">{batch.codePrefix || '—'}</Descriptions.Item>
          <Descriptions.Item label="Hạn sử dụng">
            {batch.expiresAt ? formatDate(batch.expiresAt) : 'Vô thời hạn'}
          </Descriptions.Item>

          <Descriptions.Item label="Người tạo">{batch.createdBy || '—'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{formatDate(batch.createdAt)}</Descriptions.Item>

          <Descriptions.Item label="Tiến độ sử dụng" span={2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Progress
                percent={batch.usagePercentage ?? 0}
                status={(batch.usagePercentage ?? 0) >= 100 ? 'exception' : 'active'}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: 60, textAlign: 'right' }}>{batch.usagePercentage ?? 0}%</span>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        defaultActiveKey="codes"
        items={[
          {
            key: 'codes',
            label: `Danh sách mã (${batch.codes?.length || batch.totalCodes})`,
            children: (
              <Table
                dataSource={batch.codes || []}
                columns={codeColumns}
                rowKey="id"
                pagination={{ pageSize: 20, showTotal: (t) => `Tổng ${t} mã` }}
                scroll={{ x: 600 }}
              />
            ),
          },
          {
            key: 'redemptions',
            label: 'Lịch sử đổi mã',
            children: <CodeRedemptionTable batchId={batchId} />,
          },
        ]}
      />
    </div>
  );
}
