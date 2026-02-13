'use client';

import { Typography } from 'antd';
import EncodingQueueTable from '@/components/videos/EncodingQueueTable';

const { Title } = Typography;

export default function EncodingQueuePage() {
  return (
    <div>
      <div className="page-header">
        <Title level={3}>Hàng đợi mã hóa</Title>
        <p style={{ color: '#8c8c8c' }}>Theo dõi trạng thái xử lý video realtime</p>
      </div>
      <EncodingQueueTable />
    </div>
  );
}
