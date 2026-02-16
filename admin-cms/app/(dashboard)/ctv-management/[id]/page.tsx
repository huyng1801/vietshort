'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, message, Button, Row, Col, Tabs, Tag, Space } from 'antd';
import { ArrowLeftOutlined, BankOutlined } from '@ant-design/icons';
import CTVDetails from '@/components/ctv/CTVDetails';
import CommissionCalculator from '@/components/ctv/CommissionCalculator';
import ReferralTable from '@/components/ctv/ReferralTable';
import PayoutTable from '@/components/ctv/PayoutTable';
import NetworkTree from '@/components/ctv/NetworkTree';
import adminAPI from '@/lib/admin-api';
import type { Affiliate } from '@/types';

export default function CTVDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const affiliateId = params.id as string;

  useEffect(() => {
    const fetchAffiliate = async () => {
      try {
        const res = await adminAPI.getAffiliate(affiliateId);
        setAffiliate(res.data);
      } catch {
        message.error('Không thể tải thông tin CTV');
        router.push('/ctv-management');
      } finally {
        setLoading(false);
      }
    };
    fetchAffiliate();
  }, [affiliateId, router]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  if (!affiliate) return null;

  const tabItems = [
    {
      key: 'referrals',
      label: 'Người giới thiệu',
      children: <ReferralTable affiliateId={affiliateId} />,
    },
    {
      key: 'payouts',
      label: 'Lịch sử thanh toán',
      children: <PayoutTable affiliateId={affiliateId} />,
    },
    // Show network tree tab for Tier 1/2
    ...((affiliate.tier ?? 1) < 3
      ? [
          {
            key: 'network',
            label: 'Cây mạng lưới',
            children: <NetworkTree affiliateId={affiliateId} />,
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/ctv-management')}>
            Quay lại
          </Button>
          <Space>
            <Tag icon={<BankOutlined />} color="purple" style={{ fontSize: 13, fontWeight: 600 }}>
              Cấp 1 - Công ty
            </Tag>
            <h1 className="text-2xl font-bold m-0">
              {affiliate.companyName || affiliate.realName} ({affiliate.nickname})
            </h1>
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <CTVDetails affiliate={affiliate} />
        </Col>
        <Col xs={24} lg={8}>
          <CommissionCalculator commissionRate={affiliate.commissionRate} />
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Tabs items={tabItems} />
      </div>
    </div>
  );
}
