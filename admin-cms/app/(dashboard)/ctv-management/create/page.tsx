'use client';

import { Suspense } from 'react';
import { Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import CTVForm from '@/components/ctv/CTVForm';

export default function CTVCreatePage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/ctv-management')}>
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold m-0">Thêm CTV mới</h1>
      </div>
      <Suspense fallback={<Spin />}>
        <CTVForm />
      </Suspense>
    </div>
  );
}
