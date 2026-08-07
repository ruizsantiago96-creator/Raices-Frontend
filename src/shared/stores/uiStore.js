import { create } from 'zustand'

export const useUiStore = create((set) => ({
  toasts: [],
  addToast: (msg, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  
  // Tab states for administrative and institution portals
  adminTab: localStorage.getItem('admin-tab') ?? 'overview',
  setAdminTab: (tab) => {
    localStorage.setItem('admin-tab', tab)
    set({ adminTab: tab })
  },
  instPortalTab: localStorage.getItem('inst-portal-tab') ?? 'postulaciones',
  setInstPortalTab: (tab) => {
    localStorage.setItem('inst-portal-tab', tab)
    set({ instPortalTab: tab })
  },
}))
