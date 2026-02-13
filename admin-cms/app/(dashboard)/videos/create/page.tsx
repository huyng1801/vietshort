'use client';

import { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Select, Button, message, Space, Switch, InputNumber, Divider, Tooltip, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import { generateSlug } from '@/lib/admin-utils';
import SEOAnalyzer from '@/components/videos/SEOAnalyzer';
import SEOTips from '@/components/videos/SEOTips';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateVideoPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<{ label: string; value: string; id: string }[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  
  // Fallback genres data nếu API fails
  const fallbackGenres = [
    { id: 'action', name: 'Hành động', label: 'Hành động' },
    { id: 'comedy', name: 'Hài hước', label: 'Hài hước' },
    { id: 'drama', name: 'Tâm lý', label: 'Tâm lý' },
    { id: 'romance', name: 'Tình cảm', label: 'Tình cảm' },
    { id: 'thriller', name: 'Kinh dị', label: 'Kinh dị' },
    { id: 'scifi', name: 'Khoa học viễn tưởng', label: 'Khoa học viễn tưởng' },
    { id: 'historical', name: 'Cổ trang', label: 'Cổ trang' },
    { id: 'animation', name: 'Hoạt hình', label: 'Hoạt hình' }
  ];

  useEffect(() => {
    const loadGenres = async () => {
      setGenresLoading(true);
      try {
        const res = await adminAPI.getGenres({ limit: 100, isActive: true });
        const data = res.data?.data?.items || res.data?.data || res.data?.items || res.data || [];
        
        if (Array.isArray(data) && data.length > 0) {
          const genresData = data.map((g: { id: string; name: string }) => ({
            label: g.name,
            value: g.name, // Use name as value
            id: g.id
          }));
          setGenres(genresData);
        } else {
          setGenres(fallbackGenres.map(g => ({ label: g.label, value: g.label, id: g.id })));
        }
      } catch (error) {
        console.error('Error loading genres:', error);
        setGenres(fallbackGenres.map(g => ({ label: g.label, value: g.id, id: g.id })));
      } finally {
        setGenresLoading(false);
      }
    };
    loadGenres();
  }, []);

  const generateSEOSuggestions = (title: string, description: string) => {
    if (!title) return {};
    const suggestions: Record<string, string> = {};
    if (!formValues.metaTitle) {
      suggestions.metaTitle = title.length > 60 ? `${title.substring(0, 57)}...` : `${title} - Phim HD Vietsub`;
    }
    if (!formValues.metaDescription && description) {
      const cleanDesc = description.replace(/\s+/g, ' ').trim();
      suggestions.metaDescription = cleanDesc.length > 160 ? `${cleanDesc.substring(0, 157)}...` : `Xem phim ${title}. ${cleanDesc}`;
    }
    if (!formValues.keywords && (title || description)) {
      const words = `${title} ${description}`.toLowerCase().split(/\s+/).filter(word => word.length > 3).slice(0, 3);
      const selectedGenres = formValues.genres && Array.isArray(formValues.genres) ? 
        formValues.genres.map((g: string) => g.toLowerCase()) : 
        [];
      const allKeywords = [...words, ...selectedGenres, 'phim HD', 'vietsub', 'thuyết minh'];
      suggestions.keywords = [...new Set(allKeywords)].slice(0, 8).join(', ');
    }
    return suggestions;
  };
  
  const applyAutoSEO = () => {
    const currentValues = form.getFieldsValue();
    const suggestions = generateSEOSuggestions(currentValues.title || '', currentValues.description || '');
    if (Object.keys(suggestions).length > 0) {
      form.setFieldsValue(suggestions);
      setFormValues(prev => ({ ...prev, ...suggestions }));
      message.success('Đã tự động tạo thông tin SEO!');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setFieldsValue({ title });
    if (title) {
      const slug = generateSlug(title);
      form.setFieldsValue({ slug });
      // Clean update formValues state to trigger SEO analyzer update
      setFormValues(prev => ({ ...prev, title, slug }));
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const videoData = { ...values };
      if (Array.isArray(values.genres) && values.genres.length > 0) {
        // Values are already names
        videoData.genres = values.genres.join(',');
      } else {
        videoData.genres = '';
      }
      
      const res = await adminAPI.createVideo(videoData);
      const createdVideo = res.data?.data || res.data;
      message.success('Tạo phim thành công!');
      router.push(`/videos/edit/${createdVideo.id}`); // Redirect to edit page to upload poster
    } catch (err: any) {
      console.error('Create video error:', err);
      message.error(err.response?.data?.message || 'Tạo phim thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/videos')}>Quay lại</Button>
        <Title level={3} style={{ margin: 0 }}>Thêm phim mới</Title>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="📝 Thông tin phim" style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              Nhập thông tin cơ bản của phim. Sau khi tạo xong, bạn có thể thêm poster từ danh sách video và quản lý các tập phim.
            </Text>

            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleSubmit} 
              initialValues={{ isSerial: false, isVipOnly: false, ageRating: 'ALL' }}
              onValuesChange={(_, allValues) => setFormValues(allValues)}
            >
              <Form.Item name="title" label="Tên phim" rules={[{ required: true, message: 'Vui lòng nhập tên phim' }]}>
                <Input placeholder="Nhập tên phim" maxLength={255} onChange={handleTitleChange} />
              </Form.Item>

              <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Vui lòng nhập slug' }]}>
                <Input placeholder="Auto-generated từ tiêu đề" />
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <TextArea rows={4} placeholder="Mô tả nội dung phim" maxLength={5000} showCount />
              </Form.Item>

              <Space wrap size={16}>
                <Form.Item name="isSerial" label="Loại phim" valuePropName="checked">
                  <Switch checkedChildren="Phim bộ" unCheckedChildren="Phim lẻ" />
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isSerial !== cur.isSerial}>
                  {({ getFieldValue }) => getFieldValue('isSerial') && (
                    <Form.Item name="totalEpisodes" label="Tổng số tập">
                      <InputNumber min={1} max={9999} placeholder="Số tập" />
                    </Form.Item>
                  )}
                </Form.Item>

                <Form.Item name="releaseYear" label="Năm phát hành">
                  <InputNumber min={1900} max={2100} placeholder="2024" />
                </Form.Item>

                <Form.Item name="ageRating" label="Xếp hạng tuổi">
                  <Select style={{ width: 120 }} options={[
                    { label: 'Tất cả', value: 'ALL' },
                    { label: '13+', value: 'T13' },
                    { label: '16+', value: 'T16' },
                    { label: '18+', value: 'T18' },
                  ]} />
                </Form.Item>
              </Space>

              <Form.Item name="genres" label="Thể loại">
                <Select 
                  mode="multiple" 
                  placeholder={genresLoading ? "Đang tải thể loại..." : "Chọn thể loại phim"} 
                  options={genres}
                  loading={genresLoading}
                  showSearch
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>

              <Space wrap size={16}>
                <Form.Item name="director" label="Đạo diễn">
                  <Input placeholder="Tên đạo diễn" style={{ width: 250 }} />
                </Form.Item>
                <Form.Item name="actors" label="Diễn viên">
                  <Input placeholder="Tên diễn viên (cách bởi dấu phẩy)" style={{ width: 350 }} />
                </Form.Item>
                <Form.Item name="country" label="Quốc gia">
                  <Input placeholder="VD: Trung Quốc" style={{ width: 200 }} />
                </Form.Item>
              </Space>

              <Divider>Cấu hình VIP & Giá</Divider>

              <Space wrap size={16}>
                <Form.Item name="isVipOnly" label="Chỉ VIP" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isVipOnly !== cur.isVipOnly}>
                  {({ getFieldValue }) => getFieldValue('isVipOnly') && (
                    <Form.Item name="vipTier" label="Hạng VIP yêu cầu">
                      <Select allowClear style={{ width: 160 }} placeholder="Tất cả VIP" options={[
                        { label: 'VIP 1', value: 'VIP1' },
                        { label: 'VIP 2', value: 'VIP2' },
                        { label: 'VIP 3', value: 'VIP3' },
                      ]} />
                    </Form.Item>
                  )}
                </Form.Item>
                <Form.Item name="unlockPrice" label="Giá mở khoá (Xu)">
                  <InputNumber min={0} placeholder="0 = miễn phí" />
                </Form.Item>
              </Space>

              <Divider>📈 Tối ưu SEO 
                <Tooltip title="Tự động tạo thông tin SEO từ tiêu đề và mô tả">
                  <Button type="link" icon={<ThunderboltOutlined />} onClick={applyAutoSEO} disabled={!formValues.title}>Tự động tạo</Button>
                </Tooltip>
              </Divider>

              <Form.Item name="metaTitle" label="Meta Title">
                <Input placeholder="VD: Tên Phim - Phim HD Vietsub" maxLength={60} showCount />
              </Form.Item>
              
              <Form.Item name="metaDescription" label="Meta Description">
                <Input.TextArea rows={3} placeholder="Mô tả hấp dẫn về nội dung phim" maxLength={160} showCount />
              </Form.Item>
              
              <Form.Item name="keywords" label="Keywords SEO">
                <Input placeholder="phim hành động, phim Trung Quốc, vietsub" maxLength={200} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} size="large">
                  Tạo phim mới
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={8}>
          <SEOAnalyzer 
            title={formValues.title}
            description={formValues.description}
            metaTitle={formValues.metaTitle}
            metaDescription={formValues.metaDescription}
            keywords={formValues.keywords}
            content={formValues.genres ? (formValues.genres as string[]).join(', ') : ''}
          />
          <SEOTips />
        </Col>
      </Row>
    </div>
  );
}
