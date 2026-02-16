'use client';

import React, { useState, useCallback } from 'react';
import { Card, Upload, Select, Button, message, Space, Typography, Table, Tag, Alert } from 'antd';
import { InboxOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import adminAPI from '@/lib/admin-api';

const { Dragger } = Upload;
const { Text } = Typography;

const LANGUAGES = [
  { label: '🇻🇳 Tiếng Việt', value: 'vi' },
  { label: '🇺🇸 English', value: 'en' },
];

interface SubtitleUploadProps {
  videoId: string;
  episodes: Array<{ id: string; episodeNumber: number; title?: string }>;
  onSuccess?: () => void;
}

interface FileEntry {
  file: File;
  content: string;
  episodeId: string;
  language: string;
}

export default function SubtitleUpload({ videoId, episodes, onSuccess }: SubtitleUploadProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [language, setLanguage] = useState('vi');
  const [selectedEpisode, setSelectedEpisode] = useState<string>(episodes[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file, 'utf-8');
    });
  };

  const handleFileDrop = useCallback(async (file: File) => {
    try {
      // Validate .srt format only
      if (!file.name.toLowerCase().endsWith('.srt')) {
        message.error(`Chỉ chấp nhận file .srt. File "${file.name}" không hợp lệ.`);
        return false;
      }

      const content = await readFileContent(file);
      if (!content.trim()) {
        message.error(`File ${file.name} rỗng`);
        return false;
      }

      setFiles(prev => [...prev, {
        file,
        content,
        episodeId: selectedEpisode,
        language,
      }]);
    } catch {
      message.error(`Không thể đọc file ${file.name}`);
    }
    return false;
  }, [selectedEpisode, language]);

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSingle = async (entry: FileEntry, index: number) => {
    setLoading(true);
    try {
      await adminAPI.uploadSubtitle(entry.episodeId, {
        language: entry.language,
        content: entry.content,
      });
      message.success(`Đã tải lên ${entry.file.name}`);
      setFiles(prev => prev.filter((_, i) => i !== index));
      onSuccess?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || `Lỗi tải ${entry.file.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;
    setUploading(true);

    let success = 0;
    let failed = 0;

    for (const entry of files) {
      try {
        await adminAPI.uploadSubtitle(entry.episodeId, {
          language: entry.language,
          content: entry.content,
        });
        success++;
      } catch {
        failed++;
      }
    }

    if (failed === 0) {
      message.success(`Đã tải lên ${success} file phụ đề`);
      setFiles([]);
    } else {
      message.warning(`${success} thành công, ${failed} thất bại`);
    }

    setUploading(false);
    onSuccess?.();
  };

  const episodeOptions = episodes.map(ep => ({
    label: `Tập ${ep.episodeNumber}`,
    value: ep.id,
  }));

  const getEpisodeLabel = (episodeId: string) => {
    const ep = episodes.find(e => e.id === episodeId);
    return ep ? `Tập ${ep.episodeNumber}` : episodeId;
  };

  const fileColumns = [
    {
      title: 'File',
      key: 'file',
      render: (_: any, entry: FileEntry) => (
        <div>
          <Text strong>{entry.file.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {(entry.file.size / 1024).toFixed(1)} KB • {entry.content.split('\n').length} dòng
          </Text>
        </div>
      ),
    },
    {
      title: 'Tập',
      key: 'episode',
      width: 180,
      render: (_: any, entry: FileEntry, index: number) => (
        <Select
          value={entry.episodeId}
          options={episodeOptions}
          style={{ width: '100%' }}
          size="small"
          onChange={(v) => {
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, episodeId: v } : f));
          }}
        />
      ),
    },
    {
      title: 'Ngôn ngữ',
      key: 'language',
      width: 160,
      render: (_: any, entry: FileEntry, index: number) => (
        <Select
          value={entry.language}
          options={LANGUAGES}
          style={{ width: '100%' }}
          size="small"
          onChange={(v) => {
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, language: v } : f));
          }}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_: any, entry: FileEntry, index: number) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<UploadOutlined />}
            loading={loading}
            onClick={() => handleUploadSingle(entry, index)}
          >
            Tải
          </Button>
          <Button
            size="small"
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveFile(index)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Tải phụ đề SRT">
      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        <Alert
          type="info"
          showIcon
          message="Chọn tập phim và ngôn ngữ mặc định trước khi kéo thả file. Bạn có thể thay đổi riêng cho từng file sau."
        />

        <Space>
          <span>Tập mặc định:</span>
          <Select
            value={selectedEpisode}
            onChange={setSelectedEpisode}
            options={episodeOptions}
            style={{ width: 220 }}
            placeholder="Chọn tập phim"
          />
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
          beforeUpload={handleFileDrop}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Kéo thả file phụ đề hoặc nhấp để chọn</p>
          <p className="ant-upload-hint">Chỉ hỗ trợ định dạng .srt — cho phép nhiều file cùng lúc</p>
        </Dragger>

        {files.length > 0 && (
          <>
            <Table
              columns={fileColumns}
              dataSource={files}
              rowKey={(_, i) => String(i)}
              pagination={false}
              size="small"
            />
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setFiles([])}>Xóa tất cả</Button>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  loading={uploading}
                  onClick={handleUploadAll}
                >
                  Tải lên tất cả ({files.length} file)
                </Button>
              </Space>
            </div>
          </>
        )}
      </Space>
    </Card>
  );
}
