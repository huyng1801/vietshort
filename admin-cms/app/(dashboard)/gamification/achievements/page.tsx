'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Form, message } from 'antd';
import adminAPI from '@/lib/admin-api';
import type { Achievement } from '@/types';
import AchievementsHeader from '@/components/gamification/achievements/AchievementsHeader';
import AchievementsTable from '@/components/gamification/achievements/AchievementsTable';
import AchievementFormModal from '@/components/gamification/achievements/AchievementFormModal';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Tính stats bằng useMemo thay vì useState để tránh re-render
  const stats = useMemo(() => ({
    totalAchievements: achievements.length,
    totalUnlocked: achievements.reduce((sum, a) => sum + (a._count?.userAchievements || 0), 0),
  }), [achievements]);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAchievements({
        limit: 50,
        category: filterCategory,
      });
      const data = res.data?.data || [];
      setAchievements(data);
    } catch {
      message.error('Không thể tải danh sách thành tích');
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      conditionValue: 1,
      rewardGold: 50,
      isActive: true,
      sortOrder: achievements.length + 1,
      category: 'social',
      conditionType: 'FIRST_COMMENT',
    });
    setModalOpen(true);
  };

  const handleEdit = (record: Achievement) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      if (editing) {
        // Optimistic update for edit
        const oldAchievements = achievements;
        const updatedAchievements = achievements.map((a) =>
          a.id === editing.id ? { ...a, ...values } : a
        );
        setAchievements(updatedAchievements);
        
        try {
          await adminAPI.updateAchievement(editing.id, values);
          message.success('Đã cập nhật thành tích');
          setModalOpen(false);
        } catch (err: any) {
          setAchievements(oldAchievements);
          message.error('Không thể cập nhật thành tích');
          if (err?.response?.data?.message) {
            message.error(err.response.data.message);
          }
        }
      } else {
        // For create: wait for API response before closing modal
        try {
          const res = await adminAPI.createAchievement(values);
          const newAchievement = res.data?.data;
          if (newAchievement) {
            setAchievements((prev) => [newAchievement, ...prev]);
          } else {
            fetchAchievements();
          }
          message.success('Đã tạo thành tích mới');
          setModalOpen(false);
        } catch (err: any) {
          message.error('Không thể tạo thành tích mới');
          if (err?.response?.data?.message) {
            message.error(err.response.data.message);
          }
        }
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    const oldAchievements = achievements;
    setAchievements(achievements.filter((a) => a.id !== id));
    try {
      await adminAPI.deleteAchievement(id);
      message.success('Đã xóa thành tích');
    } catch {
      setAchievements(oldAchievements);
      message.error('Không thể xóa thành tích');
    }
  };

  const handleToggle = async (id: string) => {
    // Optimistic update
    const oldAchievements = achievements;
    setAchievements(achievements.map((a) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
    try {
      await adminAPI.toggleAchievement(id);
      message.success('Đã thay đổi trạng thái');
    } catch {
      setAchievements(oldAchievements);
      message.error('Không thể thay đổi trạng thái');
    }
  };

  return (
    <div>
      <AchievementsHeader
        loading={loading}
        totalAchievements={stats.totalAchievements}
        totalUnlocked={stats.totalUnlocked}
      />

      <AchievementsTable
        achievements={achievements}
        loading={loading}
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      <AchievementFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
        loading={submitting}
      />
    </div>
  );
}
