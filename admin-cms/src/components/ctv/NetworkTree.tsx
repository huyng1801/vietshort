'use client';

import React, { useEffect, useState } from 'react';
import { Card, Tree, Tag, Typography, Spin, Empty, Space, message } from 'antd';
import {
  BankOutlined, TeamOutlined, UserOutlined, ApartmentOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { useRouter } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import { Affiliate } from '@/types/admin';
import { formatCurrency } from '@/lib/admin-utils';

interface NetworkTreeProps {
  affiliateId: string;
}

const TIER_ICONS: Record<number, React.ReactNode> = {
  1: <BankOutlined style={{ color: '#722ed1' }} />,
  2: <TeamOutlined style={{ color: '#1677ff' }} />,
  3: <UserOutlined style={{ color: '#52c41a' }} />,
};

const TIER_COLORS: Record<number, string> = { 1: 'purple', 2: 'blue', 3: 'green' };

function affiliateToTreeNode(affiliate: Affiliate): DataNode {
  const title = (
    <Space size={4}>
      <Tag color={TIER_COLORS[affiliate.tier]} style={{ fontSize: 10 }}>
        Cấp {affiliate.tier}
      </Tag>
      <Typography.Text strong>{affiliate.companyName || affiliate.realName}</Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        ({affiliate.referralCode})
      </Typography.Text>
      <Tag color="orange">{(affiliate.commissionRate * 100).toFixed(0)}%</Tag>
      <Typography.Text style={{ color: '#52c41a', fontSize: 12 }}>
        {formatCurrency(affiliate.totalEarned || 0)}
      </Typography.Text>
      {affiliate.isActive ? (
        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
      ) : (
        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
      )}
    </Space>
  );

  return {
    key: affiliate.id,
    title,
    icon: TIER_ICONS[affiliate.tier],
    children: affiliate.children?.map(affiliateToTreeNode) || [],
  };
}

export default function NetworkTree({ affiliateId }: NetworkTreeProps) {
  const router = useRouter();
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getAffiliateTree(affiliateId);
        const rootAffiliate = res.data;
        setTreeData([affiliateToTreeNode(rootAffiliate)]);
      } catch {
        message.error('Không thể tải cây mạng lưới');
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [affiliateId]);

  if (loading) return <Card><Spin style={{ display: 'block', textAlign: 'center', padding: 40 }} /></Card>;

  if (treeData.length === 0) {
    return <Card><Empty description="Không có dữ liệu mạng lưới" /></Card>;
  }

  return (
    <Card
      title={
        <Space>
          <ApartmentOutlined />
          <span>Cây mạng lưới CTV</span>
        </Space>
      }
    >
      <Tree
        showIcon
        showLine={{ showLeafIcon: false }}
        defaultExpandAll
        treeData={treeData}
        onSelect={(keys) => {
          if (keys.length > 0) {
            router.push(`/ctv-management/${keys[0]}`);
          }
        }}
        style={{ fontSize: 13 }}
      />
    </Card>
  );
}
