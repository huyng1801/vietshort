'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Form, Input, Select, Button, message, Space, Switch, InputNumber, Divider, Tooltip, Row, Col, Spin, Upload } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ThunderboltOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import adminAPI from '@/lib/admin-api';
import { generateSlug } from '@/lib/admin-utils';
import SEOAnalyzer from '@/components/videos/SEOAnalyzer';
import SEOTips from '@/components/videos/SEOTips';
import type { Video } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.id as string;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [video, setVideo] = useState<Video | null>(null);
  const [genres, setGenres] = useState<{ label: string; value: string; id: string }[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string>('');
  
  // Fallback genres data
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

  // Fetch video data
  const fetchVideo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getVideo(videoId);
      const data = res.data?.data || res.data;
      setVideo(data);
      setPosterUrl(data.poster || '');
      
      // Parse genres string to array
      const genresArray = data.genres ? data.genres.split(',').map((g: string) => g.trim()) : [];
      
      // Set form values
      form.setFieldsValue({
        title: data.title,
        slug: data.slug,
        description: data.description,
        isSerial: data.isSerial,
        totalEpisodes: data.totalEpisodes,
        releaseYear: data.releaseYear,
        ageRating: data.ageRating || 'ALL',
        genres: genresArray,
        director: data.director,
        actors: data.actors,
        country: data.country,
        isVipOnly: data.isVipOnly,
        vipTier: data.vipTier,
        unlockPrice: data.unlockPrice,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
      });
      
      setFormValues({
        title: data.title,
        description: data.description,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        genres: genresArray,
      });
    } catch (err: any) {
      message.error('Không thể tải thông tin video');
      router.push('/videos');
    } finally {
      setLoading(false);
    }
  }, [videoId, form, router]);

  // Fetch genres
  useEffect(() => {
    const loadGenres = async () => {
      setGenresLoading(true);
      try {
        const res = await adminAPI.getGenres({ limit: 100, isActive: true });
        const data = res.data?.data?.items || res.data?.data || res.data?.items || res.data || [];
        
        if (Array.isArray(data) && data.length > 0) {
          const genresData = data.map((g: { id: string; name: string }) => ({
            label: g.name,
            value: g.name,
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

  // Fetch video on mount
  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

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
      setFormValues(prev => ({ ...prev, title, slug }));
    }
  };

  const handlePosterUpload = async (file: File) => {
    setUploadingPoster(true);
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        setUploadingPoster(false);
        return false;
      }

      // Get presigned URL for poster
      const urlRes = await adminAPI.getPosterUploadUrl(videoId, file.type || 'image/jpeg');
      const responseData = urlRes.data?.data || urlRes.data;
      
      if (!responseData?.uploadUrl) {
        throw new Error('Không nhận được URL upload từ server');
      }

      const { uploadUrl, publicUrl } = responseData;

      // Upload to R2 using XMLHttpRequest
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });

      // Update video with new poster URL
      if (publicUrl) {
        await adminAPI.updatePoster(videoId, publicUrl);
        setPosterUrl(publicUrl);
        message.success('Cập nhật poster thành công!');
      } else {
        throw new Error('Không nhận được public URL từ server');
      }
    } catch (error: any) {
      console.error('Upload poster error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Upload poster thất bại';
      message.error(errorMsg);
    } finally {
      setUploadingPoster(false);
    }
    
    return false; // Prevent default upload behavior
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const videoData = { ...values };
      
      // Remove slug from update data (slug shouldn't be updated after creation)
      delete videoData.slug;
      
      if (Array.isArray(values.genres) && values.genres.length > 0) {
        videoData.genres = values.genres.join(',');
      } else {
        videoData.genres = '';
      }
      
      await adminAPI.updateVideo(videoId, videoData);
      message.success('Cập nhật phim thành công!');
      router.push('/videos');
    } catch (err: any) {
      console.error('Update video error:', err);
      message.error(err.response?.data?.message || 'Cập nhật phim thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/videos')}>Quay lại</Button>
        <Title level={3} style={{ margin: 0 }}>Chỉnh sửa: {video.title}</Title>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="📝 Thông tin phim" style={{ marginBottom: 16 }}>
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleSubmit} 
              onValuesChange={(_, allValues) => setFormValues(allValues)}
            >
              {/* Poster Upload */}
              <Form.Item label="Poster phim">
                <Space orientation="vertical" style={{ width: '100%' }}>
                  {posterUrl && (
                    <div style={{ marginBottom: 12 }}>
                      <img 
                        src={posterUrl} 
                        alt="Poster" 
                        style={{ width: 200, height: 280, objectFit: 'cover', borderRadius: 8 }} 
                      />
                    </div>
                  )}
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handlePosterUpload}
                  >
                    <Button icon={<UploadOutlined />} loading={uploadingPoster}>
                      {posterUrl ? 'Thay đổi Poster' : 'Upload Poster'}
                    </Button>
                  </Upload>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Kích thước khuyến nghị: 600x900px, tối đa 5MB
                  </Text>
                </Space>
              </Form.Item>

              <Divider />

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
                <Space>
                  <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />} size="large">
                    Lưu thay đổi
                  </Button>
                  <Button onClick={() => router.push(`/videos/${videoId}`)} size="large">
                    Quản lý tập phim
                  </Button>
                </Space>
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
