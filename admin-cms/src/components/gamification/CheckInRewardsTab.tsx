'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, Row, Col, InputNumber, Input, Switch, Button, message,
  Statistic, Tag, Space, Divider,
} from 'antd';
import {
  CalendarOutlined, GoldOutlined, SaveOutlined, ReloadOutlined,
} from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';
import type { CheckInReward } from '@/types/admin';

const DAY_LABELS = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const DAY_COLORS = ['', '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2', '#f5222d'];

interface CheckInStats {
  totalCheckIns: number;
  todayCheckIns: number;
  weekCheckIns: number;
  totalGoldGiven: number;
}

export default function CheckInRewardsTab() {
  const [rewards, setRewards] = useState<CheckInReward[]>([]);
  const [editedRewards, setEditedRewards] = useState<Record<number, Partial<CheckInReward>>>({});
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rewardsRes, statsRes] = await Promise.all([
        adminAPI.getCheckInRewards(),
        adminAPI.getCheckInStats(),
      ]);
      setRewards(rewardsRes.data || []);
      setStats(statsRes.data || null);
      setEditedRewards({});
      setHasChanges(false);
    } catch {
      message.error('Không thể tải dữ liệu điểm danh');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (day: number, field: string, value: any) => {
    setEditedRewards((prev) => ({
      ...prev,
      [day]: { ...prev[day], day, [field]: value },
    }));
    setHasChanges(true);
  };

  const getRewardValue = (day: number, field: keyof CheckInReward) => {
    if (editedRewards[day] && editedRewards[day][field] !== undefined) {
      return editedRewards[day][field];
    }
    const reward = rewards.find((r) => r.day === day);
    return reward ? reward[field] : field === 'rewardGold' ? 0 : field === 'isActive' ? true : '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rewardsToUpdate = [];
      for (let day = 1; day <= 7; day++) {
        const original = rewards.find((r) => r.day === day);
        const edited = editedRewards[day];
        if (edited) {
          rewardsToUpdate.push({
            day,
            rewardGold: (edited.rewardGold ?? original?.rewardGold) || 0,
            description: (edited.description ?? original?.description) || `Điểm danh ngày ${day}`,
            isActive: edited.isActive ?? original?.isActive ?? true,
          });
        }
      }

      if (rewardsToUpdate.length === 0) {
        message.info('Chưa có thay đổi nào');
        setSaving(false);
        return;
      }

      await adminAPI.bulkUpdateCheckInRewards(rewardsToUpdate);
      message.success('Đã lưu cấu hình điểm danh');
      fetchData();
    } catch {
      message.error('Không thể lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const totalGoldPerCycle = Array.from({ length: 7 }, (_, i) => {
    const v = getRewardValue(i + 1, 'rewardGold');
    return typeof v === 'number' ? v : 0;
  }).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" loading={loading}>
            <Statistic
              title="Tổng điểm danh"
              value={stats?.totalCheckIns || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" loading={loading}>
            <Statistic
              title="Hôm nay"
              value={stats?.todayCheckIns || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" loading={loading}>
            <Statistic
              title="Tuần này"
              value={stats?.weekCheckIns || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" loading={loading}>
            <Statistic
              title="Tổng vàng đã phát"
              value={stats?.totalGoldGiven || 0}
              prefix={<GoldOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Config */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <h3 style={{ margin: 0 }}>Cấu hình phần thưởng 7 ngày</h3>
          <Tag color="gold">Tổng: {totalGoldPerCycle} 🪙 / chu kỳ</Tag>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanges}
          >
            Lưu thay đổi
          </Button>
        </Space>
      </div>

      <Row gutter={[12, 12]}>
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={Math.floor(24 / 7) || 3} key={day}>
            <Card
              size="small"
              title={
                <span style={{ color: DAY_COLORS[day] }}>
                  <CalendarOutlined /> Ngày {day} {day === 7 ? '🎉' : ''}
                </span>
              }
              extra={
                <Switch
                  size="small"
                  checked={getRewardValue(day, 'isActive') as boolean}
                  onChange={(v) => handleChange(day, 'isActive', v)}
                />
              }
              style={{
                borderColor: day === 7 ? '#f5222d' : undefined,
                borderWidth: day === 7 ? 2 : 1,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Thưởng vàng</div>
                <InputNumber
                  min={0}
                  value={getRewardValue(day, 'rewardGold') as number}
                  onChange={(v) => handleChange(day, 'rewardGold', v || 0)}
                  style={{ width: '100%' }}
                  addonAfter="🪙"
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Mô tả</div>
                <Input
                  size="small"
                  value={getRewardValue(day, 'description') as string}
                  onChange={(e) => handleChange(day, 'description', e.target.value)}
                  placeholder={`Ngày ${day}`}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
