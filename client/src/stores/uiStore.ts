import { create } from 'zustand';

let toastIdCounter = 0;

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  
  // Mobile Navigation
  isMobileMenuOpen: boolean;
  
  // Modal
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Player
  isFullscreen: boolean;
  isTheaterMode: boolean;
  
  // Loading states
  isPageLoading: boolean;
  
  // Toast notifications
  toasts: Toast[];
}

interface UIActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Mobile menu
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Modal
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Player
  setFullscreen: (fullscreen: boolean) => void;
  setTheaterMode: (theaterMode: boolean) => void;
  
  // Loading
  setPageLoading: (loading: boolean) => void;
  
  // Toast
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const initialState: UIState = {
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  activeModal: null,
  modalData: null,
  theme: 'dark',
  isFullscreen: false,
  isTheaterMode: false,
  isPageLoading: false,
  toasts: [],
};

export const useUIStore = create<UIState & UIActions>()((set, get) => ({
  ...initialState,

  // Sidebar
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),

  // Mobile menu
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),

  // Modal
  openModal: (activeModal, modalData) => set({ activeModal, modalData: modalData ?? null }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Theme
  setTheme: (theme) => {
    set({ theme });
    // Theme is managed by next-themes ThemeProvider in layout
    // This store only tracks the UI state
  },

  // Player
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setTheaterMode: (isTheaterMode) => set({ isTheaterMode }),

  // Loading
  setPageLoading: (isPageLoading) => set({ isPageLoading }),

  // Toast
  addToast: (toast) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { ...toast, id };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  clearToasts: () => set({ toasts: [] }),
}));