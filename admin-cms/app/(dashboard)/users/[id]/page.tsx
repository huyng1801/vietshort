'use client';

import { useEffect, useState, useCallback } from 'react';
import { Typography, Button, Space, message, Spin, Tabs } from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  DollarOutlined,
  PlayCircleOutlined,
  UnlockOutlined,
  CalendarOutlined,
  TrophyOutlined,
  CommentOutlined,
  HeartOutlined,
  GiftOutlined,
  TeamOutlined,
  AuditOutlined,
  BarChartOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import type { User, WalletTransaction } from '@/types';

import UserDetails from '@/components/users/UserDetails';
import WalletVipManager from '@/components/users/WalletVipManager';
import UserEngagement from '@/components/users/UserEngagement';
import WatchHistory from '@/components/users/WatchHistory';
import UnlockHistory from '@/components/users/UnlockHistory';
import CheckInHistory from '@/components/users/CheckInHistory';
import UserGamification from '@/components/users/UserGamification';
import UserComments from '@/components/users/UserComments';
import UserTransactions from '@/components/users/UserTransactions';
import UserExchangeRedeems from '@/components/users/UserExchangeRedeems';
import UserSocialActivity from '@/components/users/UserSocialActivity';
import UserReferrals from '@/components/users/UserReferrals';
import UserAuditLogs from '@/components/users/UserAuditLogs';

const { Title } = Typography;

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await adminAPI.getUser(userId);
      setUser(res.data?.data || res.data);
    } catch {
      message.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await adminAPI.getUserTransactions(userId, { page: 1, limit: 10 });
      const result = res.data?.data || res.data;
      setTransactions(result?.items || result?.data || []);
    } catch {
      // silent
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
    fetchTransactions();
  }, [fetchUser, fetchTransactions]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Title level={4}>Không tìm thấy người dùng</Title>
        <Button type="primary" onClick={() => router.push('/users')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleRefresh = () => {
    fetchUser();
    fetchTransactions();
  };

  const tabItems = [
    {
      key: 'info',
      label: <span><UserOutlined /> Thông tin</span>,
      children: (
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <UserDetails user={user} onRefresh={handleRefresh} />
        </Space>
      ),
    },
    {
      key: 'wallet',
      label: <span><CrownOutlined /> Xu & VIP</span>,
      children: (
        <WalletVipManager
          userId={userId}
          currentBalance={user.goldBalance || 0}
          vipTier={user.vipTier as any}
          vipExpiresAt={user.vipExpiresAt}
          transactions={transactions}
          onRefresh={handleRefresh}
        />
      ),
    },
    {
      key: 'engagement',
      label: <span><BarChartOutlined /> Thống kê</span>,
      children: <UserEngagement userId={userId} />,
    },
    {
      key: 'transactions',
      label: <span><DollarOutlined /> Giao dịch</span>,
      children: <UserTransactions userId={userId} />,
    },
    {
      key: 'watch',
      label: <span><PlayCircleOutlined /> Lịch sử xem</span>,
      children: <WatchHistory userId={userId} />,
    },
    {
      key: 'unlocks',
      label: <span><UnlockOutlined /> Mở khóa</span>,
      children: <UnlockHistory userId={userId} />,
    },
    {
      key: 'comments',
      label: <span><CommentOutlined /> Bình luận</span>,
      children: <UserComments userId={userId} />,
    },
    {
      key: 'social',
      label: <span><HeartOutlined /> Tương tác</span>,
      children: <UserSocialActivity userId={userId} />,
    },
    {
      key: 'checkin',
      label: <span><CalendarOutlined /> Điểm danh</span>,
      children: <CheckInHistory userId={userId} />,
    },
    {
      key: 'gamification',
      label: <span><TrophyOutlined /> Gamification</span>,
      children: <UserGamification userId={userId} />,
    },
    {
      key: 'exchange',
      label: <span><GiftOutlined /> Mã đổi</span>,
      children: <UserExchangeRedeems userId={userId} />,
    },
    {
      key: 'referrals',
      label: <span><TeamOutlined /> Giới thiệu</span>,
      children: <UserReferrals userId={userId} />,
    },
    {
      key: 'audit',
      label: <span><AuditOutlined /> Nhật ký</span>,
      children: <UserAuditLogs userId={userId} />,
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/users')}
        />
        <Title level={3} style={{ margin: 0 }}>
          Chi tiết người dùng: {user.nickname || user.email}
        </Title>
      </div>

      <Tabs
        defaultActiveKey="info"
        items={tabItems}
        type="card"
        size="large"
        destroyInactiveTabPane
      />
    </div>
  );
}
