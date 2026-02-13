'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result
        status="500"
        title="Đã xảy ra lỗi"
        subTitle={error.message || 'Có lỗi xảy ra, vui lòng thử lại.'}
        extra={[
          <Button key="retry" type="primary" onClick={reset}>
            Thử lại
          </Button>,
          <Button key="home" onClick={() => router.push('/dashboard')}>
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  );
}
