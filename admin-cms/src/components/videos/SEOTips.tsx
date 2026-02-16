'use client';

import { Card, Typography, List, Tag, Space } from 'antd';
import { CheckCircleOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export default function SEOTips() {
  const tips = [
    {
      title: 'Tiêu đề tối ưu',
      description: 'Sử dụng 50-60 ký tự, chứa từ khóa chính ở đầu',
      level: 'high'
    },
    {
      title: 'Mô tả hấp dẫn',
      description: '120-160 ký tự, có call-to-action, mô tả nội dung cụ thể',
      level: 'high'
    },
    {
      title: 'Từ khóa đúng',
      description: '3-5 từ khóa chính, tránh spam keywords',
      level: 'medium'
    },
    {
      title: 'Nội dung chất lượng',
      description: 'Mô tả chi tiết, thông tin đầy đủ về phim',
      level: 'medium'
    },
    {
      title: 'Thể loại rõ ràng',
      description: 'Chọn đúng thể loại giúp tìm kiếm hiệu quả',
      level: 'low'
    }
  ];

  const bestPractices = [
    'Phim hành động → "Phim hành động", "action", "võ thuật"',
    'Phim Trung Quốc → "phim Trung Quốc", "drama Hoa ngữ"',
    'Thuyết minh → "thuyết minh", "lồng tiếng"',
    'Vietsub → "vietsub", "phụ đề Việt"'
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return <FireOutlined />;
      case 'medium': return <TrophyOutlined />;
      case 'low': return <CheckCircleOutlined />;
      default: return null;
    }
  };

  return (
    <Card title="💡 Tips SEO" size="small">
      <Space orientation="vertical" style={{ width: '100%' }}>
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 12, fontSize: 14 }}>
            Nguyên tắc SEO hiệu quả
          </Title>
          <List
            size="small"
            dataSource={tips}
            renderItem={(tip) => (
              <List.Item style={{ padding: '6px 0', border: 'none' }}>
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <Tag 
                      color={getLevelColor(tip.level)}
                      icon={getLevelIcon(tip.level)}
                      style={{ fontSize: 11 }}
                    >
                      {tip.title}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>
                    {tip.description}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <Title level={5} style={{ margin: 0, marginBottom: 12, fontSize: 14 }}>
            Từ khóa thông dụng
          </Title>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: '#666' }}>
            {bestPractices.map((practice, index) => (
              <div key={index} style={{ marginBottom: 6 }}>
                • {practice}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 4 }}>
          <Text strong style={{ fontSize: 12, color: '#0366d6' }}>
            🎯 Mục tiêu: Điểm SEO {'>'} 80
          </Text>
          <br />
          <Text style={{ fontSize: 11, color: '#586069' }}>
            Điểm cao giúp phim dễ dàng được tìm thấy trên Google và các công cụ tìm kiếm khác.
          </Text>
        </div>
      </Space>
    </Card>
  );
}