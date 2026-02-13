// Navigation
export interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

// Form
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Modal
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

// Toast
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Breadcrumb
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Table
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Filters
export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range';
  options: FilterOption[];
}

// Comments
export interface Comment {
  id: string;
  userId: string;
  user: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

// Notifications
export interface Notification {
  id: string;
  type: 'system' | 'video' | 'comment' | 'wallet' | 'vip';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// SEO
export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video';
}

// Theme
export type Theme = 'light' | 'dark' | 'system';

// Language
export type Language = 'vi' | 'en';

// Breakpoints
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Status
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Generic callback types
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;
export type ValueCallback<T> = (value: T) => void;
export type AsyncValueCallback<T> = (value: T) => Promise<void>;