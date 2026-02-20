'use client';

import { Tabs } from 'antd';
import {
  SettingOutlined,
  CrownOutlined,
  GoldOutlined,
  TeamOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { GeneralSettings, VIPPricingSettings, GoldPricingSettings, AdminUsersSettings } from '@/components/settings';
import { AdsSettingsTab } from '@/components/ads';

export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Cài đặt hệ thống</h1>
      </div>

      <Tabs
        defaultActiveKey="general"
        tabPosition="left"
        style={{ minHeight: 400 }}
        items={[
          {
            key: 'general',
            label: <><SettingOutlined /> Cài đặt chung</>,
            children: <GeneralSettings />,
          },
          {
            key: 'vip',
            label: <><CrownOutlined /> Bảng giá VIP</>,
            children: <VIPPricingSettings />,
          },
          {
            key: 'gold',
            label: <><GoldOutlined /> Bảng giá nạp Gold</>,
            children: <GoldPricingSettings />,
          },
          {
            key: 'admins',
            label: <><TeamOutlined /> Quản lý Admin</>,
            children: <AdminUsersSettings />,
          },
          {
            key: 'ads',
            label: <><NotificationOutlined /> Quảng cáo & AdMob</>,
            children: <AdsSettingsTab />,
          },
        ]}
      />
    </div>
  );
}
