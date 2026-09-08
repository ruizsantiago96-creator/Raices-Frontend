import { create } from 'zustand'

export interface Toast {
  id: number | string
  msg: string
  type: 'info' | 'success' | 'warning' | 'error' | string
}

export interface UiState {
  toasts: Toast[]
  addToast: (msg: string, type?: Toast['type']) => void
  removeToast: (id: number | string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  adminTab: string
  setAdminTab: (tab: string) => void
  instPortalTab: string
  setInstPortalTab: (tab: string) => void
  floatingChatOpen: boolean
  setFloatingChatOpen: (open: boolean) => void
  toggleFloatingChat: () => void
  floatingChatMinimized: boolean
  setFloatingChatMinimized: (min: boolean) => void
  floatingChatMaximized: boolean
  setFloatingChatMaximized: (max: boolean) => void
  floatingChatPartnerId: string | number | null
  setFloatingChatPartnerId: (id: string | number | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  addToast: (msg: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000)
  },
  removeToast: (id: number | string) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  sidebarOpen: false,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  
  // Tab states for administrative and institution portals
  adminTab: localStorage.getItem('admin-tab') ?? 'overview',
  setAdminTab: (tab: string) => {
    localStorage.setItem('admin-tab', tab)
    set({ adminTab: tab })
  },
  instPortalTab: localStorage.getItem('inst-portal-tab') ?? 'postulaciones',
  setInstPortalTab: (tab: string) => {
    localStorage.setItem('inst-portal-tab', tab)
    set({ instPortalTab: tab })
  },

  // Floating chat states
  floatingChatOpen: false,
  setFloatingChatOpen: (open: boolean) => set({ floatingChatOpen: open }),
  toggleFloatingChat: () => set(s => ({ floatingChatOpen: !s.floatingChatOpen })),
  floatingChatMinimized: false,
  setFloatingChatMinimized: (min: boolean) => set({ floatingChatMinimized: min }),
  floatingChatMaximized: false,
  setFloatingChatMaximized: (max: boolean) => set({ floatingChatMaximized: max }),
  floatingChatPartnerId: null,
  setFloatingChatPartnerId: (id: string | number | null) => set({ floatingChatPartnerId: id }),
}))
