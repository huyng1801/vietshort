import { create } from 'zustand';

interface AdminUIState {
  sidebarCollapsed: boolean;
  activeMenuKey: string;
  breadcrumbs: { title: string; path?: string }[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveMenuKey: (key: string) => void;
  setBreadcrumbs: (breadcrumbs: { title: string; path?: string }[]) => void;
}

export const useAdminUIStore = create<AdminUIState>((set) => ({
  sidebarCollapsed: false,
  activeMenuKey: 'dashboard',
  breadcrumbs: [{ title: 'Dashboard' }],

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveMenuKey: (key) => set({ activeMenuKey: key }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));
