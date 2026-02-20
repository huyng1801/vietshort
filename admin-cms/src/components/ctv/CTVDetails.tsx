'use client';

import React from 'react';
import { Card, Descriptions, Tag, Typography, Row, Col, Statistic, Button, Table, Space, Tooltip } from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined,
  BankOutlined, TeamOutlined, UserOutlined, ApartmentOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Affiliate } from '@/types';
import { formatCurrency, formatNumber, formatDate } from '@/lib/admin-utils';

interface CTVDetailsProps {
  affiliate: Affiliate;
}

const TIER_CONFIG: Record<number, { color: string; label: string; icon: React.ReactNode }> = {
  1: { color: '#722ed1', label: 'Cấp 1 - Công ty', icon: <BankOutlined /> },
  2: { color: '#1677ff', label: 'Cấp 2 - CTV', icon: <TeamOutlined /> },
  3: { color: '#52c41a', label: 'Cấp 3 - CTV phụ', icon: <UserOutlined /> },
};

export default function CTVDetails({ affiliate }: CTVDetailsProps) {
  const router = useRouter();
  const tier = TIER_CONFIG[affiliate.tier ?? 1] || TIER_CONFIG[1];

  const childColumns = [
    {
      title: 'Cấp',
      key: 'tier',
      width: 80,
      render: (_: unknown, r: Affiliate) => {
        const t = TIER_CONFIG[r.tier ?? 1] || TIER_CONFIG[1];
        return <Tag color={t.color}>{t.label}</Tag>;
      },
    },
    { title: 'Mã CTV', dataIndex: 'referralCode', key: 'code', width: 100 },
    {
      title: 'Tên',
      key: 'name',
      render: (_: unknown, r: Affiliate) => (
        <div>
          <Typography.Text strong>{r.realName}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{r.email}</Typography.Text>
        </div>
      ),
    },
    {
      title: 'Hoa hồng',
      dataIndex: 'commissionRate',
      key: 'rate',
      width: 90,
      render: (v: number) => <Tag color="orange">{(v * 100).toFixed(0)}%</Tag>,
    },
    {
      title: 'Thu nhập',
      dataIndex: 'totalEarned',
      key: 'earned',
      width: 120,
      render: (v: number) => <Typography.Text style={{ color: '#52c41a' }}>{formatCurrency(v || 0)}</Typography.Text>,
    },
    {
      title: 'Mạng',
      key: 'network',
      width: 80,
      render: (_: unknown, r: Affiliate) => <span>{r._count?.children || 0}</span>,
    },
    {
      title: 'TT',
      key: 'status',
      width: 80,
      render: (_: unknown, r: Affiliate) => (
        r.isActive ? <Tag color="green">On</Tag> : <Tag color="red">Off</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, r: Affiliate) => (
        <Tooltip title="Xem chi tiết">
          <Button icon={<EyeOutlined />} size="small" onClick={() => router.push(`/ctv-management/${r.id}`)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      {/* Stats Row */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Cấp bậc" valueRender={() => <Tag color={tier.color} icon={tier.icon} style={{ fontSize: 14 }}>{tier.label}</Tag>} />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small"><Statistic title="Clicks" value={affiliate.totalClicks || 0} /></Card>
        </Col>
        <Col span={5}>
          <Card size="small"><Statistic title="Đăng ký" value={affiliate.totalRegistrations || 0} /></Card>
        </Col>
        <Col span={5}>
          <Card size="small"><Statistic title="Người mua" value={affiliate.totalPurchasers || 0} /></Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic
              title="Tổng thu nhập"
              value={(affiliate.totalEarned || 0) + (affiliate.networkEarned || 0)}
              prefix="₫"
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Network stats (Tier 1/2) */}
      {(affiliate.tier ?? 1) < 3 && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Thành viên mạng lưới"
                value={affiliate.networkMembers || 0}
                prefix={<ApartmentOutlined />}
                styles={{ content: { color: '#722ed1' } }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="CTV cấp dưới" value={affiliate._count?.children || 0} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Thu nhập mạng lưới"
                value={affiliate.networkEarned || 0}
                prefix="₫"
                styles={{ content: { color: '#722ed1' } }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Referrals" value={affiliate._count?.referrals || 0} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Info */}
      <Card title="Thông tin CTV" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Tên thật">{affiliate.realName}</Descriptions.Item>
          <Descriptions.Item label="Biệt danh">{affiliate.nickname}</Descriptions.Item>
          <Descriptions.Item label="Email">{affiliate.email}</Descriptions.Item>
          <Descriptions.Item label="Điện thoại">{affiliate.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Công ty">{affiliate.companyName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Loại">
            <Tag color={affiliate.affiliateType === 'COMPANY' ? 'purple' : 'blue'}>
              {affiliate.affiliateType === 'COMPANY' ? 'Công ty' : 'Cá nhân'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mã giới thiệu">
            <Tag color="blue">{affiliate.referralCode}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {affiliate.isActive ? (
              <Tag icon={<CheckCircleOutlined />} color="green">Hoạt động</Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="red">Vô hiệu</Tag>
            )}
            {affiliate.isVerified && (
              <Tag icon={<SafetyCertificateOutlined />} color="blue" style={{ marginLeft: 4 }}>Đã xác thực</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Tỷ lệ hoa hồng">
            <Tag color="orange">{(affiliate.commissionRate * 100).toFixed(0)}%</Tag>
          </Descriptions.Item>
          {affiliate.parent && (
            <Descriptions.Item label="CTV cha">
              <Button type="link" size="small" style={{ padding: 0 }} onClick={() => router.push(`/ctv-management/${affiliate.parent!.id}`)}>
                {affiliate.parent.companyName || affiliate.parent.realName} (Cấp {affiliate.parent.tier})
              </Button>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Link giới thiệu" span={2}>
            <Typography.Text copyable>{affiliate.referralUrl}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Chờ thanh toán">
            <Typography.Text style={{ color: (affiliate.pendingPayout || 0) > 0 ? '#faad14' : undefined }}>
              {formatCurrency(affiliate.pendingPayout || 0)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Đã thanh toán">
            <Typography.Text style={{ color: '#52c41a' }}>{formatCurrency(affiliate.paidOut || 0)}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngân hàng">{affiliate.bankName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Số TK">{affiliate.bankAccount || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{formatDate(affiliate.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Cập nhật">{formatDate(affiliate.updatedAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Contract Info (Tier 1 only) */}
      {affiliate.tier === 1 && (
        <Card title="Thông tin hợp đồng" style={{ marginBottom: 16 }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Ngày bắt đầu">
              {affiliate.contractStartAt ? formatDate(affiliate.contractStartAt) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {affiliate.contractEndAt ? formatDate(affiliate.contractEndAt) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {affiliate.contractNotes || 'Chưa có ghi chú'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Sub-affiliates (Tier 1/2) */}
      {(affiliate.tier ?? 1) < 3 && affiliate.children && affiliate.children.length > 0 && (
        <Card
          title={
            <Space>
              <ApartmentOutlined />
              <span>CTV cấp dưới ({affiliate.children.length})</span>
            </Space>
          }
          extra={null}
        >
          <Table
            dataSource={affiliate.children}
            columns={childColumns}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Admin không tạo sub-CTV - chỉ xem */}
      {(affiliate.tier ?? 1) < 3 && (!affiliate.children || affiliate.children.length === 0) && (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Typography.Text type="secondary">Công ty chưa có CTV cấp dưới</Typography.Text>
          </div>
        </Card>
      )}
    </>
  );
}
