import * as crypto from 'crypto';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateRandomCode(length = 8): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length).toUpperCase();
}

export function generateChecksum(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

export function formatCurrency(amount: number, currency = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

export function paginateArray<T>(items: T[], page: number, limit: number): { data: T[]; total: number } {
  const start = (page - 1) * limit;
  return { data: items.slice(start, start + limit), total: items.length };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
}
