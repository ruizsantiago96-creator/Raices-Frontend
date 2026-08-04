import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useUiStore } from '../uiStore'

// Reset store between tests
let idCounter = 0
beforeEach(() => {
  idCounter = 0
  vi.useFakeTimers()
  vi.spyOn(Date, 'now').mockImplementation(() => ++idCounter)
  useUiStore.setState({
    toasts: [],
    sidebarOpen: false,
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('shared/stores/uiStore', () => {
  // ═══════════════════════════════════════════════════════════════
  // Initial State
  // ═══════════════════════════════════════════════════════════════
  describe('initial state', () => {
    it('has empty toasts array', () => {
      expect(useUiStore.getState().toasts).toEqual([])
    })

    it('has sidebarOpen as false', () => {
      expect(useUiStore.getState().sidebarOpen).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Toasts
  // ═══════════════════════════════════════════════════════════════
  describe('addToast', () => {
    it('adds a toast with default type "info"', () => {
      useUiStore.getState().addToast('Hello')
      const { toasts } = useUiStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0].msg).toBe('Hello')
      expect(toasts[0].type).toBe('info')
      expect(toasts[0].id).toBeDefined()
    })

    it('adds a toast with custom type', () => {
      useUiStore.getState().addToast('Error occurred', 'error')
      expect(useUiStore.getState().toasts[0].type).toBe('error')
    })

    it('adds multiple toasts with unique ids', () => {
      useUiStore.getState().addToast('First')
      useUiStore.getState().addToast('Second')
      const ids = useUiStore.getState().toasts.map(t => t.id)
      expect(ids).toHaveLength(2)
      expect(new Set(ids).size).toBe(2) // all unique
    })

    it('auto-removes toast after 4 seconds', () => {
      useUiStore.getState().addToast('Temporary')
      expect(useUiStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(4000)

      expect(useUiStore.getState().toasts).toHaveLength(0)
    })

    it('removes only the specific toast after timeout', () => {
      useUiStore.getState().addToast('First')
      useUiStore.getState().addToast('Second')

      vi.advanceTimersByTime(4000)

      expect(useUiStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('removeToast', () => {
    it('removes a toast by id', () => {
      useUiStore.getState().addToast('First')
      useUiStore.getState().addToast('Second')
      const id = useUiStore.getState().toasts[0].id

      useUiStore.getState().removeToast(id)

      expect(useUiStore.getState().toasts).toHaveLength(1)
      expect(useUiStore.getState().toasts[0].msg).toBe('Second')
    })

    it('does nothing when removing non-existent id', () => {
      useUiStore.getState().addToast('Only one')
      useUiStore.getState().removeToast(99999)
      expect(useUiStore.getState().toasts).toHaveLength(1)
    })

    it('works with empty toasts array', () => {
      expect(() => useUiStore.getState().removeToast(1)).not.toThrow()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Sidebar
  // ═══════════════════════════════════════════════════════════════
  describe('sidebar', () => {
    it('setSidebarOpen(true) opens sidebar', () => {
      useUiStore.getState().setSidebarOpen(true)
      expect(useUiStore.getState().sidebarOpen).toBe(true)
    })

    it('setSidebarOpen(false) closes sidebar', () => {
      useUiStore.getState().setSidebarOpen(true)
      useUiStore.getState().setSidebarOpen(false)
      expect(useUiStore.getState().sidebarOpen).toBe(false)
    })

    it('toggleSidebar toggles from false to true', () => {
      useUiStore.getState().toggleSidebar()
      expect(useUiStore.getState().sidebarOpen).toBe(true)
    })

    it('toggleSidebar toggles from true to false', () => {
      useUiStore.getState().setSidebarOpen(true)
      useUiStore.getState().toggleSidebar()
      expect(useUiStore.getState().sidebarOpen).toBe(false)
    })

    it('toggleSidebar works with multiple toggles', () => {
      useUiStore.getState().toggleSidebar()  // true
      useUiStore.getState().toggleSidebar()  // false
      useUiStore.getState().toggleSidebar()  // true
      expect(useUiStore.getState().sidebarOpen).toBe(true)
    })
  })
})
