'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Spin, message, Row, Col, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import UserDetails from '@/components/users/UserDetails';
import WalletManager from '@/components/users/WalletManager';
import adminAPI from '@/lib/admin-api';
import type { User, WalletTransaction } from '@/types/admin';

const { Title } = Typography;

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = params.id as string;

  const fetchUser = async () => {
    try {
      const res = await adminAPI.getUser(userId);
      setUser(res.data);
    } catch {
      message.error('Không thể tải thông tin người dùng');
      router.push('/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await adminAPI.getUserTransactions(userId);
      setTransactions(res.data?.items || []);
    } catch {
      // Transactions endpoint might not exist yet, just show empty
      setTransactions([]);
    }
  };

  useEffect(() => { 
    fetchUser();
    fetchTransactions();
  }, [userId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  if (!user) return null;

  return (
    <div>
      <div className="page-header">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/users')} style={{ marginBottom: 16 }}>
          Quay lại
        </Button>
        <Title level={3}>Chi tiết người dùng: {user.nickname || 'Không có tên'}</Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <UserDetails user={user} onRefresh={fetchUser} />
        </Col>
        <Col xs={24} lg={10}>
          <WalletManager 
            userId={userId} 
            currentBalance={user.goldBalance || 0}
            transactions={transactions}
            onRefresh={() => {
              fetchUser();
              fetchTransactions();
            }}
          />
        </Col>
      </Row>
    </div>
  );
}
