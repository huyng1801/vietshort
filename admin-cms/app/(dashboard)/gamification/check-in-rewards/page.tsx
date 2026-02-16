'use client';

import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import adminAPI from '@/lib/admin-api';
import type { CheckInReward } from '@/types';
import CheckInRewardsHeader from '@/components/gamification/check-in-rewards/CheckInRewardsHeader';
import CheckInRewardsConfig from '@/components/gamification/check-in-rewards/CheckInRewardsConfig';

interface CheckInStats {
  totalCheckIns: number;
  todayCheckIns: number;
  weekCheckIns: number;
  totalGoldGiven: number;
}

export default function CheckInRewardsPage() {
  const [rewards, setRewards] = useState<CheckInReward[]>([]);
  const [editedRewards, setEditedRewards] = useState<Record<number, Partial<CheckInReward>>>({});
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const refetchData = useCallback(async () => {
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
      message.error('Không thể tải lại dữ liệu');
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    // Nếu có thay đổi chưa lưu, hỏi xác nhận
    if (hasChanges) {
      const shouldProceed = window.confirm('Có thay đổi chưa lưu. Bạn có muốn làm mới?');
      if (!shouldProceed) return;
    }

    setLoading(true);
    try {
      // Fetch dữ liệu từ server
      const [rewardsRes, statsRes] = await Promise.all([
        adminAPI.getCheckInRewards(),
        adminAPI.getCheckInStats(),
      ]);
      setRewards(rewardsRes.data || []);
      setStats(statsRes.data || null);
      setEditedRewards({});
      setHasChanges(false);
      message.info('Đã làm mới dữ liệu');
    } catch {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [hasChanges]);

  useEffect(() => {
    // Initial load
    (async () => {
      setLoading(true);
      try {
        const [rewardsRes, statsRes] = await Promise.all([
          adminAPI.getCheckInRewards(),
          adminAPI.getCheckInStats(),
        ]);
        setRewards(rewardsRes.data || []);
        setStats(statsRes.data || null);
      } catch {
        message.error('Không thể tải dữ liệu điểm danh');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = useCallback((day: number, field: string, value: any) => {
    setEditedRewards((prev) => ({
      ...prev,
      [day]: { ...prev[day], day, [field]: value },
    }));
    setHasChanges(true);
  }, []);

  const getRewardValue = useCallback((day: number, field: keyof CheckInReward) => {
    return editedRewards[day]?.[field] !== undefined
      ? editedRewards[day][field]
      : rewards.find((r) => r.day === day)?.[field] ?? (field === 'rewardGold' ? 0 : field === 'isActive' ? true : '');
  }, [editedRewards, rewards]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const rewardsToUpdate: { day: number; rewardGold: number; description: string; isActive: boolean }[] = [];
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

      // Optimistic update - cập nhật UI ngay lập tức
      const newRewards = rewards.map((r) => {
        const updated = rewardsToUpdate.find((u) => u.day === r.day);
        return updated ? { ...r, ...updated } : r;
      });
      setRewards(newRewards);
      setEditedRewards({});
      setHasChanges(false);
      setSaving(false);
      
      // Thông báo thành công
      message.success('Đã lưu cấu hình điểm danh');

      // API call and sync in background (không chặn UI)
      try {
        await adminAPI.bulkUpdateCheckInRewards(rewardsToUpdate);
        
        // Refresh stats in background
        const statsRes = await adminAPI.getCheckInStats();
        setStats(statsRes.data || null);
      } catch (error) {
        // Nếu API fail, revert lại
        message.error('Không thể đồng bộ với máy chủ');
        await refetchData();
      }
    } catch {
      setSaving(false);
      message.error('Không thể lưu cấu hình');
    }
  };

  const totalGoldPerCycle = Array.from({ length: 7 }, (_, i) => {
    const v = getRewardValue(i + 1, 'rewardGold');
    return typeof v === 'number' ? v : 0;
  }).reduce((a, b) => a + b, 0);

  return (
    <div>
      <CheckInRewardsHeader loading={loading} stats={stats} />

      <CheckInRewardsConfig
        rewards={rewards}
        editedRewards={editedRewards}
        loading={loading}
        saving={saving}
        hasChanges={hasChanges}
        totalGoldPerCycle={totalGoldPerCycle}
        getRewardValue={getRewardValue}
        onChange={handleChange}
        onSave={handleSave}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
