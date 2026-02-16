'use client';

import EncodingQueueTable from '@/components/videos/EncodingQueueTable';

export default function EncodingQueuePage() {
  return (
    <div>
      <div className="page-header">
        <h1>Hàng đợi mã hóa</h1>
        <p style={{ color: '#8c8c8c' }}>Theo dõi trạng thái xử lý video realtime</p>
      </div>
      <EncodingQueueTable />
    </div>
  );
}
