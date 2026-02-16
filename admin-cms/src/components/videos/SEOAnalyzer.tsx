'use client';

import { Card, Progress, Alert, Typography, Space, Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

const { Text } = Typography;

interface SEOScore {
  score: number;
  issues: {
    type: 'error' | 'warning' | 'success';
    message: string;
  }[];
}

interface SEOAnalyzerProps {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  content?: string;
}

export default function SEOAnalyzer({
  title = '',
  description = '',
  metaTitle = '',
  metaDescription = '',
  keywords = '',
  content = '',
}: SEOAnalyzerProps) {
  const [seoScore, setSeoScore] = useState<SEOScore>({ score: 0, issues: [] });

  const analyzeSEO = () => {
    const issues: SEOScore['issues'] = [];
    let score = 0;

    // Title Analysis
    const effectiveTitle = metaTitle || title;
    if (!effectiveTitle) {
      issues.push({ type: 'error', message: 'Thiếu tiêu đề (Title)' });
    } else if (effectiveTitle.length < 30) {
      issues.push({ type: 'warning', message: 'Tiêu đề quá ngắn (< 30 ký tự)' });
      score += 0.5;
    } else if (effectiveTitle.length > 60) {
      issues.push({ type: 'warning', message: 'Tiêu đề quá dài (> 60 ký tự)' });
      score += 0.5;
    } else {
      issues.push({ type: 'success', message: 'Độ dài tiêu đề phù hợp (30-60 ký tự)' });
      score += 1;
    }

    // Meta Description Analysis
    const effectiveDescription = metaDescription || description;
    if (!effectiveDescription) {
      issues.push({ type: 'warning', message: 'Thiếu meta description' });
    } else if (effectiveDescription.length < 120) {
      issues.push({ type: 'warning', message: 'Meta description quá ngắn (< 120 ký tự)' });
      score += 0.5;
    } else if (effectiveDescription.length > 160) {
      issues.push({ type: 'warning', message: 'Meta description quá dài (> 160 ký tự)' });
      score += 0.5;
    } else {
      issues.push({ type: 'success', message: 'Meta description có độ dài phù hợp (120-160 ký tự)' });
      score += 1;
    }

    // Keywords Analysis
    if (!keywords) {
      issues.push({ type: 'warning', message: 'Chưa có từ khóa SEO' });
    } else {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      if (keywordList.length === 0) {
        issues.push({ type: 'warning', message: 'Chưa có từ khóa SEO' });
      } else if (keywordList.length < 3) {
        issues.push({ type: 'warning', message: 'Nên có ít nhất 3 từ khóa' });
        score += 0.5;
      } else if (keywordList.length > 10) {
        issues.push({ type: 'warning', message: 'Có quá nhiều từ khóa (> 10)' });
        score += 0.5;
      } else {
        issues.push({ type: 'success', message: `Có ${keywordList.length} từ khóa phù hợp` });
        score += 1;
      }
    }

    // Title and Description Uniqueness
    if (effectiveTitle && effectiveDescription) {
      const titleWords = effectiveTitle.toLowerCase().split(/\s+/);
      const descWords = effectiveDescription.toLowerCase().split(/\s+/);
      const commonWords = titleWords.filter(word => descWords.includes(word) && word.length > 3);
      
      if (commonWords.length > 0) {
        issues.push({ type: 'success', message: 'Title và description có từ khóa chung' });
        score += 0.5;
      }
    }

    // Content and Genres Analysis
    if (description && description.length > 300) {
      issues.push({ type: 'success', message: 'Mô tả nội dung chi tiết' });
      score += 0.5;
    }
    
    // Check if genres/categories are mentioned in content
    if (content && content.trim()) {
      issues.push({ type: 'success', message: 'Đã chọn thể loại phim' });
      score += 0.3;
    } else {
      issues.push({ type: 'warning', message: 'Chưa chọn thể loại phim' });
    }

    // Keyword Density in Title
    if (keywords && effectiveTitle) {
      const keywordList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      const titleLower = effectiveTitle.toLowerCase();
      const foundKeywords = keywordList.filter(keyword => titleLower.includes(keyword));
      
      if (foundKeywords.length > 0) {
        issues.push({ type: 'success', message: 'Tiêu đề chứa từ khóa mục tiêu' });
        score += 0.5;
      } else if (keywordList.length > 0) {
        issues.push({ type: 'warning', message: 'Tiêu đề chưa chứa từ khóa mục tiêu' });
      }
    }

    const finalScore = Math.min(100, Math.round((score / 5.3) * 100));
    setSeoScore({ score: finalScore, issues });
  };

  useEffect(() => {
    analyzeSEO();
  }, [title, description, metaTitle, metaDescription, keywords, content]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    if (score >= 40) return '#fa8c16';
    return '#ff4d4f';
  };

  const getScoreStatus = (score: number): 'success' | 'normal' | 'exception' => {
    if (score >= 80) return 'success';
    if (score >= 40) return 'normal';
    return 'exception';
  };

  return (
    <Card title="📊 Phân tích SEO" size="small" style={{ marginBottom: 16 }}>
      <Space orientation="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Progress 
            percent={seoScore.score} 
            strokeColor={getScoreColor(seoScore.score)}
            status={getScoreStatus(seoScore.score)}
            style={{ flex: 1 }}
          />
          <Text strong style={{ color: getScoreColor(seoScore.score) }}>
            {seoScore.score}/100
          </Text>
        </div>

        {seoScore.issues.length > 0 && (
          <div>
            {seoScore.issues.map((issue, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                <Tag 
                  icon={
                    issue.type === 'error' ? <CloseCircleOutlined /> :
                    issue.type === 'warning' ? <ExclamationCircleOutlined /> :
                    <CheckCircleOutlined />
                  }
                  color={
                    issue.type === 'error' ? 'red' :
                    issue.type === 'warning' ? 'orange' :
                    'green'
                  }
                >
                  {issue.message}
                </Tag>
              </div>
            ))}
          </div>
        )}

        {seoScore.score < 80 && (
          <Alert
            message="💡 Gợi ý cải thiện"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {!title && !metaTitle && <li>Thêm tiêu đề hấp dẫn có chứa từ khóa chính</li>}
                {!metaDescription && !description && <li>Viết mô tả chi tiết 120-160 ký tự</li>}
                {!keywords && <li>Thêm 3-7 từ khóa liên quan đến nội dung phim</li>}
                {(!content || !content.trim()) && <li>Chọn thể loại phim phù hợp để tăng độ chính xác tìm kiếm</li>}
                {(metaTitle || title) && metaTitle !== title && <li>Sử dụng Meta Title khác biệt để tối ưu SEO</li>}
              </ul>
            }
            type="info"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
}