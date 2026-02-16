'use client';

import { memo } from 'react';
import { Card, Row, Col, InputNumber, Input, Switch, Button, Tag, Space } from 'antd';
import { CalendarOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import type { CheckInReward } from '@/types';

const DAY_COLORS = ['', '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2', '#f5222d'];

interface CheckInRewardsConfigProps {
  rewards: CheckInReward[];
  editedRewards: Record<number, Partial<CheckInReward>>;
  loading: boolean;
  saving: boolean;
  hasChanges: boolean;
  totalGoldPerCycle: number;
  getRewardValue: (day: number, field: keyof CheckInReward) => any;
  onChange: (day: number, field: string, value: any) => void;
  onSave: () => void;
  onRefresh: () => void;
}

export default memo(function CheckInRewardsConfig({
  rewards,
  editedRewards,
  loading,
  saving,
  hasChanges,
  totalGoldPerCycle,
  getRewardValue,
  onChange,
  onSave,
  onRefresh,
}: CheckInRewardsConfigProps) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <h3 style={{ margin: 0 }}>Cấu hình phần thưởng 7 ngày</h3>
          <Tag color="gold">Tổng: {totalGoldPerCycle} 🪙 / chu kỳ</Tag>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={onSave}
            loading={saving}
            disabled={!hasChanges}
          >
            Lưu thay đổi
          </Button>
        </Space>
      </div>

      <Row gutter={[12, 12]}>
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={6} key={day}>
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
                  onChange={(v) => onChange(day, 'isActive', v)}
                />
              }
              style={{
                borderColor: day === 7 ? '#f5222d' : undefined,
                borderWidth: day === 7 ? 2 : 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              bodyStyle={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Thưởng vàng</div>
                <InputNumber
                  min={0}
                  value={getRewardValue(day, 'rewardGold') as number}
                  onChange={(v) => onChange(day, 'rewardGold', v || 0)}
                  style={{ width: '100%' }}
                  addonAfter="🪙"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Mô tả</div>
                <Input
                  size="small"
                  value={getRewardValue(day, 'description') as string}
                  onChange={(e) => onChange(day, 'description', e.target.value)}
                  placeholder={`Ngày ${day}`}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
});
