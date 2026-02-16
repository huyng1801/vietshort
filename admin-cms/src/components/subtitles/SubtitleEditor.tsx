'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, Button, Space, message, Typography, Tag, Descriptions, Alert, Statistic, Row, Col } from 'antd';
import { SaveOutlined, CloseOutlined, UndoOutlined, FormatPainterOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import adminAPI from '@/lib/admin-api';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const { Text } = Typography;

interface SubtitleEditorProps {
  subtitleId: string;
  content: string;
  language: string;
  label?: string;
  onSave?: () => void;
  onClose?: () => void;
}

/**
 * Parse SRT content to extract subtitle statistics
 */
function parseSrtStats(content: string) {
  const blocks = content.trim().split(/\n\n+/).filter(Boolean);
  const lineCount = content.split('\n').length;
  const charCount = content.length;

  let totalDuration = 0;
  const entries: { index: number; start: number; end: number; text: string }[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;

    const timeMatch = lines[1]?.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/,
    );

    if (timeMatch) {
      const startMs = (+timeMatch[1] * 3600 + +timeMatch[2] * 60 + +timeMatch[3]) * 1000 + +timeMatch[4];
      const endMs = (+timeMatch[5] * 3600 + +timeMatch[6] * 60 + +timeMatch[7]) * 1000 + +timeMatch[8];
      totalDuration += endMs - startMs;
      entries.push({
        index: parseInt(lines[0]) || 0,
        start: startMs,
        end: endMs,
        text: lines.slice(2).join('\n'),
      });
    }
  }

  return {
    blocks: blocks.length,
    entries: entries.length,
    lineCount,
    charCount,
    totalDuration: (totalDuration / 1000).toFixed(1),
  };
}

export default function SubtitleEditor({ subtitleId, content, language, label, onSave, onClose }: SubtitleEditorProps) {
  const [value, setValue] = useState(content);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);

  const stats = useMemo(() => parseSrtStats(value), [value]);

  const handleChange = (v: string | undefined) => {
    setValue(v || '');
    setModified(true);
  };

  const handleSave = useCallback(async () => {
    if (!value.trim()) {
      message.error('Nội dung phụ đề không được để trống');
      return;
    }
    setSaving(true);
    try {
      await adminAPI.updateSubtitleContent(subtitleId, value);
      setModified(false);
      onSave?.();
    } catch {
      message.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }, [subtitleId, value, onSave]);

  const handleReset = () => {
    setValue(content);
    setModified(false);
  };

  return (
    <Card
      title={
        <Space>
          <span>Trình soạn thảo phụ đề</span>
          <Tag color="blue">{label || language}</Tag>
          {modified && <Tag color="orange">Đã sửa</Tag>}
        </Space>
      }
      extra={
        <Space>
          {onClose && (
            <Button icon={<CloseOutlined />} onClick={onClose}>Đóng</Button>
          )}
          <Button icon={<UndoOutlined />} onClick={handleReset} disabled={!modified}>
            Hoàn tác
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            disabled={!modified}
          >
            Lưu thay đổi
          </Button>
        </Space>
      }
    >
      {/* Stats bar */}
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <Statistic title="Đoạn phụ đề" value={stats.entries} styles={{ content: { fontSize: 18 } }} />
        </Col>
        <Col span={6}>
          <Statistic title="Tổng ký tự" value={stats.charCount} styles={{ content: { fontSize: 18 } }} />
        </Col>
        <Col span={6}>
          <Statistic title="Số dòng" value={stats.lineCount} styles={{ content: { fontSize: 18 } }} />
        </Col>
        <Col span={6}>
          <Statistic title="Thời lượng (s)" value={stats.totalDuration} styles={{ content: { fontSize: 18 } }} />
        </Col>
      </Row>

      <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
        <MonacoEditor
          height="550px"
          defaultLanguage="plaintext"
          value={value}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            tabSize: 2,
            folding: false,
            padding: { top: 8, bottom: 8 },
            suggestOnTriggerCharacters: false,
            quickSuggestions: false,
          }}
        />
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginTop: 12 }}
        message="Định dạng SRT: Mỗi đoạn gồm số thứ tự, timestamp (HH:MM:SS,mmm --> HH:MM:SS,mmm), và nội dung. Các đoạn cách nhau bởi dòng trống."
      />
    </Card>
  );
}
