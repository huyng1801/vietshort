'use client';

import React, { useState, useCallback } from 'react';
import { Card, Upload, Select, Button, message, Space, Typography, Table, Tag, Alert, Progress } from 'antd';
import { InboxOutlined, UploadOutlined, ThunderboltOutlined, DeleteOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';

const { Dragger } = Upload;
const { Text } = Typography;

const LANGUAGES = [
  { label: '🇻🇳 Tiếng Việt', value: 'vi' },
  { label: '🇺🇸 English', value: 'en' },
];

interface SubtitleMappingProps {
  videoId: string;
  episodes: Array<{ id: string; episodeNumber: number; title?: string }>;
  onSuccess?: () => void;
}

interface MappedFile {
  file: File;
  content: string;
  episodeId: string;
  language: string;
  autoMapped: boolean;
}

/**
 * Extract episode number from filename.
 * Only supports format: ep01.srt, ep02.srt, etc.
 * e.g. "ep01.srt" → 1, "ep02.srt" → 2
 */
function extractEpNumber(filename: string): number | null {
  const match = filename.match(/^ep(\d+)\.srt$/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

/**
 * Detect language from file drop - for ep01.srt format, language comes from the default selection
 */

export default function SubtitleMapping({ videoId, episodes, onSuccess }: SubtitleMappingProps) {
  const [mapped, setMapped] = useState<MappedFile[]>([]);
  const [language, setLanguage] = useState('vi');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file, 'utf-8');
    });
  };

  const handleFilesDrop = useCallback(async (file: File) => {
    try {
      // Validate .srt format only
      if (!file.name.toLowerCase().endsWith('.srt')) {
        message.error(`Chỉ chấp nhận file .srt. File "${file.name}" không hợp lệ.`);
        return false;
      }

      // Validate naming format: ep01.srt, ep02.srt, etc.
      const epNum = extractEpNumber(file.name);
      if (epNum === null) {
        message.error(`File "${file.name}" không đúng định dạng. Sử dụng: ep01.srt, ep02.srt, ...`);
        return false;
      }

      const content = await readFile(file);
      if (!content.trim()) {
        message.warning(`File ${file.name} rỗng, bỏ qua`);
        return false;
      }

      // Find matching episode by episode number
      const matchedEp = episodes.find(ep => ep.episodeNumber === epNum);
      if (!matchedEp) {
        message.warning(`File ${file.name}: Không tìm thấy tập ${epNum}`);
        return false;
      }

      setMapped(prev => [...prev, {
        file,
        content,
        episodeId: matchedEp.id,
        language,
        autoMapped: true,
      }]);
    } catch {
      message.error(`Không thể đọc ${file.name}`);
    }
    return false;
  }, [episodes, language]);

  const handleRemove = (index: number) => {
    setMapped(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkUpload = async () => {
    const valid = mapped.filter(m => m.episodeId);
    if (valid.length === 0) {
      message.error('Chưa có file nào được gán tập phim');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const mappings = valid.map(m => ({
        episodeId: m.episodeId,
        language: m.language,
        content: m.content,
      }));

      const res = await adminAPI.bulkUploadSubtitles(videoId, mappings);
      const results = res.data;
      const success = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success).length;

      if (failed === 0) {
        message.success(`Đã tải lên ${success} file phụ đề`);
        setMapped([]);
      } else {
        message.warning(`${success} thành công, ${failed} thất bại`);
        // Keep failed ones
        const failedIds = new Set(
          results.filter((r: any) => !r.success).map((r: any) => r.episodeId),
        );
        setMapped(prev => prev.filter(m => failedIds.has(m.episodeId)));
      }

      onSuccess?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Upload hàng loạt thất bại');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const unmappedCount = mapped.filter(m => !m.episodeId).length;
  const episodeOptions = episodes.map(ep => ({
    label: `Tập ${ep.episodeNumber}`,
    value: ep.id,
  }));

  const columns = [
    {
      title: 'File',
      key: 'file',
      render: (_: any, entry: MappedFile) => (
        <div>
          <Text strong>{entry.file.name}</Text>
          {entry.autoMapped && <Tag color="green" style={{ marginLeft: 6 }}>Tự động</Tag>}
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {(entry.file.size / 1024).toFixed(1)} KB
          </Text>
        </div>
      ),
    },
    {
      title: 'Tập phim',
      key: 'episode',
      width: 200,
      render: (_: any, entry: MappedFile, index: number) => (
        <Select
          value={entry.episodeId || undefined}
          options={episodeOptions}
          style={{ width: '100%' }}
          size="small"
          placeholder="Chọn tập"
          status={!entry.episodeId ? 'warning' : undefined}
          onChange={(v) => {
            setMapped(prev => prev.map((m, i) => i === index ? { ...m, episodeId: v, autoMapped: false } : m));
          }}
        />
      ),
    },
    {
      title: 'Ngôn ngữ',
      key: 'language',
      width: 170,
      render: (_: any, entry: MappedFile, index: number) => (
        <Select
          value={entry.language}
          options={LANGUAGES}
          style={{ width: '100%' }}
          size="small"
          onChange={(v) => {
            setMapped(prev => prev.map((m, i) => i === index ? { ...m, language: v } : m));
          }}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: any, _entry: MappedFile, index: number) => (
        <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemove(index)} />
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined />
          <span>Upload hàng loạt & tự động gán tập</span>
        </Space>
      }
    >
      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        <Alert
          type="info"
          showIcon
          message="Hệ thống tự động gán tập dựa trên tên file (ep01.srt → Tập 1, ep02.srt → Tập 2, ...). Tất cả file sẽ dùng ngôn ngữ mặc định đã chọn."
        />

        <Space>
          <span>Ngôn ngữ mặc định:</span>
          <Select
            value={language}
            onChange={setLanguage}
            options={LANGUAGES}
            style={{ width: 200 }}
          />
        </Space>

        <Dragger
          multiple
          accept=".srt"
          fileList={[]}
          beforeUpload={handleFilesDrop}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Kéo thả nhiều file phụ đề cùng lúc</p>
          <p className="ant-upload-hint">
            Chỉ hỗ trợ .srt — File tên theo mẫu: ep01.srt, ep02.srt, ...
          </p>
        </Dragger>

        {mapped.length > 0 && (
          <>
            {unmappedCount > 0 && (
              <Alert
                type="warning"
                showIcon
                message={`${unmappedCount} file chưa được gán tập phim. Vui lòng chọn tập phim cho chúng.`}
              />
            )}

            <Table
              columns={columns}
              dataSource={mapped}
              rowKey={(_, i) => String(i)}
              pagination={false}
              size="small"
            />

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Text type="secondary">
                  {mapped.filter(m => m.autoMapped).length} tự nhận dạng •{' '}
                  {mapped.filter(m => m.episodeId).length}/{mapped.length} sẵn sàng
                </Text>
                <Button onClick={() => setMapped([])}>Xóa tất cả</Button>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  loading={uploading}
                  onClick={handleBulkUpload}
                  disabled={mapped.filter(m => m.episodeId).length === 0}
                >
                  Upload hàng loạt ({mapped.filter(m => m.episodeId).length} file)
                </Button>
              </Space>
            </div>
          </>
        )}
      </Space>
    </Card>
  );
}
