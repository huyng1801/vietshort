'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Form, message } from 'antd';
import adminAPI from '@/lib/admin-api';
import type { DailyTask } from '@/types';
import DailyTasksHeader from '@/components/gamification/daily-tasks/DailyTasksHeader';
import DailyTasksTable from '@/components/gamification/daily-tasks/DailyTasksTable';
import DailyTaskFormModal from '@/components/gamification/daily-tasks/DailyTaskFormModal';

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DailyTask | null>(null);
  const [form] = Form.useForm();

  // Tính stats bằng useMemo thay vì useState + useEffect để tránh re-render
  const stats = useMemo(() => ({
    activeTasks: tasks.filter((t) => t.isActive).length,
    totalTasks: tasks.length,
    todayCompletions: 0,
  }), [tasks]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDailyTasks({ limit: 50 });
      const data = res.data?.data || [];
      setTasks(data);
    } catch {
      message.error('Không thể tải danh sách nhiệm vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ targetCount: 1, rewardGold: 10, isActive: true, sortOrder: tasks.length + 1 });
    setModalOpen(true);
  };

  const handleEdit = (record: DailyTask) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        // Optimistic update for edit
        const oldTasks = tasks;
        const updatedTasks = tasks.map((t) =>
          t.id === editing.id ? { ...t, ...values } : t
        );
        setTasks(updatedTasks);
        setModalOpen(false);
        try {
          await adminAPI.updateDailyTask(editing.id, values);
          message.success('Đã cập nhật nhiệm vụ');
        } catch {
          setTasks(oldTasks);
          message.error('Không thể cập nhật nhiệm vụ');
        }
      } else {
        // For create: wait for API response to avoid double render flick
        setModalOpen(false);
        try {
          const res = await adminAPI.createDailyTask(values);
          const newTask = res.data?.data;
          if (newTask) {
            setTasks((prevTasks) => [newTask, ...prevTasks]);
          } else {
            fetchTasks();
          }
          message.success('Đã tạo nhiệm vụ mới');
        } catch (err: any) {
          message.error('Không thể tạo nhiệm vụ mới');
          if (err?.response?.data?.message) {
            message.error(err.response.data.message);
          }
        }
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    const oldTasks = tasks;
    const updatedTasks = tasks.filter((t) => t.id !== id);

    setTasks(updatedTasks);

    try {
      await adminAPI.deleteDailyTask(id);
      message.success('Đã xóa nhiệm vụ');
    } catch {
      setTasks(oldTasks);
      message.error('Không thể xóa nhiệm vụ');
    }
  };

  const handleToggle = async (id: string) => {
    // Optimistic update
    const oldTasks = tasks;
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, isActive: !task.isActive } : task
    );

    setTasks(updatedTasks);

    try {
      await adminAPI.toggleDailyTask(id);
      message.success('Đã thay đổi trạng thái');
    } catch {
      setTasks(oldTasks);
      message.error('Không thể thay đổi trạng thái');
    }
  };

  return (
    <div>
      <DailyTasksHeader
        loading={loading}
        activeTasks={stats.activeTasks}
        totalTasks={stats.totalTasks}
        todayCompletions={stats.todayCompletions}
      />

      <DailyTasksTable
        tasks={tasks}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      <DailyTaskFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
