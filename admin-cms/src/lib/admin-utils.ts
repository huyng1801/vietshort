import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export function formatDate(date: string | Date, format = 'DD/MM/YYYY HH:mm') {
  return dayjs(date).format(format);
}

export function formatRelativeTime(date: string | Date) {
  return dayjs(date).fromNow();
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString('vi-VN');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase();
  const colors: Record<string, string> = {
    published: 'green',
    active: 'green',
    completed: 'green',
    approved: 'green',
    paid: 'blue',
    draft: 'default',
    inactive: 'default',
    pending: 'orange',
    processing: 'orange',
    encoding: 'orange',
    archived: 'orange',
    hidden: 'red',
    failed: 'red',
    rejected: 'red',
    suspended: 'red',
    banned: 'red',
    deleted: 'red',
  };
  return colors[normalizedStatus] || 'default';
}

export function getStatusText(status: string): string {
  const normalizedStatus = status.toLowerCase();
  const texts: Record<string, string> = {
    published: 'Đã xuất bản',
    active: 'Hoạt động',
    completed: 'Hoàn thành',
    approved: 'Đã duyệt',
    paid: 'Đã thanh toán',
    draft: 'Bản nháp',
    inactive: 'Không hoạt động',
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    encoding: 'Đang mã hóa',
    archived: 'Lưu trữ',
    hidden: 'Ẩn',
    failed: 'Thất bại',
    rejected: 'Từ chối',
    suspended: 'Tạm khóa',
    banned: 'Đã cấm',
    deleted: 'Đã xóa',
  };
  return texts[normalizedStatus] || status;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 50%)`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
