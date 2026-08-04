import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../store/authStore'

// Mock notification stream dependencies
const mockSuspendStream = vi.fn()
const mockCloseNotificationStream = vi.fn()
const mockResumeStream = vi.fn()

vi.mock('@features/notifications', () => ({
  closeNotificationStream: (...args) => mockCloseNotificationStream(...args),
  suspendStream: (...args) => mockSuspendStream(...args),
  resumeStream: (...args) => mockResumeStream(...args),
}))

beforeEach(() => {
  mockSuspendStream.mockClear()
  mockCloseNotificationStream.mockClear()
  mockResumeStream.mockClear()

  // Reset store
  useAuthStore.setState({ token: null, user: null, refreshToken: null })
  localStorage.clear()
  sessionStorage.clear()
})

describe('features/auth/store/authStore', () => {
  // ═══════════════════════════════════════════════════════════════
  // Initial State
  // ═══════════════════════════════════════════════════════════════
  describe('initial state', () => {
    it('has null token initially', () => {
      expect(useAuthStore.getState().token).toBeNull()
    })

    it('has null user initially', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('has null refreshToken initially', () => {
      expect(useAuthStore.getState().refreshToken).toBeNull()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // setAuth
  // ═══════════════════════════════════════════════════════════════
  describe('setAuth', () => {
    const mockUser = { id: '1', email: 'test@test.com', role: 'pcd', full_name: 'Test User' }

    it('sets token, user, and refreshToken', () => {
      useAuthStore.getState().setAuth('token-123', mockUser, 'refresh-456', true)
      const s = useAuthStore.getState()
      expect(s.token).toBe('token-123')
      expect(s.user).toEqual(mockUser)
      expect(s.refreshToken).toBe('refresh-456')
    })

    it('resumes the notification stream', () => {
      useAuthStore.getState().setAuth('token', mockUser, 'refresh', true)
      expect(mockResumeStream).toHaveBeenCalledTimes(1)
    })

    it('saves token to localStorage when rememberMe=true', () => {
      useAuthStore.getState().setAuth('token-123', mockUser, 'refresh', true)
      expect(localStorage.getItem('raices_token')).toBe('token-123')
    })

    it('saves token to sessionStorage when rememberMe=false', () => {
      useAuthStore.getState().setAuth('token-123', mockUser, 'refresh', false)
      expect(sessionStorage.getItem('raices_token')).toBe('token-123')
    })

    it('saves refresh token', () => {
      useAuthStore.getState().setAuth('token', mockUser, 'refresh-xyz', true)
      expect(localStorage.getItem('raices_refresh')).toBe('refresh-xyz')
    })

    it('saves user data', () => {
      useAuthStore.getState().setAuth('token', mockUser, 'refresh', true)
      const stored = JSON.parse(localStorage.getItem('raices_user'))
      expect(stored).toEqual(mockUser)
    })

    it('handles null refresh token', () => {
      useAuthStore.getState().setAuth('token', mockUser, null, true)
      expect(useAuthStore.getState().refreshToken).toBeNull()
    })

    it('handles undefined refresh token', () => {
      useAuthStore.getState().setAuth('token', mockUser, undefined, true)
      expect(useAuthStore.getState().refreshToken).toBeNull()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // logout
  // ═══════════════════════════════════════════════════════════════
  describe('logout', () => {
    it('clears token, user, and refreshToken', () => {
      useAuthStore.getState().setAuth('token', { id: '1' }, 'refresh', true)
      useAuthStore.getState().logout()

      const s = useAuthStore.getState()
      expect(s.token).toBeNull()
      expect(s.user).toBeNull()
      expect(s.refreshToken).toBeNull()
    })

    it('suspends the notification stream before clearing state', () => {
      useAuthStore.getState().logout()
      expect(mockSuspendStream).toHaveBeenCalledTimes(1)
    })

    it('closes the notification stream', () => {
      useAuthStore.getState().logout()
      expect(mockCloseNotificationStream).toHaveBeenCalledTimes(1)
    })

    it('clears tokens from localStorage', () => {
      localStorage.setItem('raices_token', 'token')
      localStorage.setItem('raices_refresh', 'refresh')
      localStorage.setItem('raices_user', JSON.stringify({ id: '1' }))

      useAuthStore.getState().logout()

      expect(localStorage.getItem('raices_token')).toBeNull()
      expect(localStorage.getItem('raices_refresh')).toBeNull()
      expect(localStorage.getItem('raices_user')).toBeNull()
    })

    it('clears tokens from sessionStorage', () => {
      sessionStorage.setItem('raices_token', 'token')
      sessionStorage.setItem('raices_refresh', 'refresh')

      useAuthStore.getState().logout()

      expect(sessionStorage.getItem('raices_token')).toBeNull()
      expect(sessionStorage.getItem('raices_refresh')).toBeNull()
    })

    it('does NOT remove raices_remember preference', () => {
      localStorage.setItem('raices_remember', 'true')
      useAuthStore.getState().logout()
      expect(localStorage.getItem('raices_remember')).toBe('true')
    })

    it('is safe to call multiple times', () => {
      expect(() => {
        useAuthStore.getState().logout()
        useAuthStore.getState().logout()
      }).not.toThrow()
    })

    it('is safe to call when already logged out', () => {
      expect(() => useAuthStore.getState().logout()).not.toThrow()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // State transitions
  // ═══════════════════════════════════════════════════════════════
  describe('state transitions', () => {
    it('full login -> logout cycle', () => {
      const user = { id: '1', email: 'test@test.com', role: 'pcd' }

      // Login
      useAuthStore.getState().setAuth('token-abc', user, 'refresh-xyz', true)
      expect(useAuthStore.getState().token).toBe('token-abc')
      expect(useAuthStore.getState().user).toEqual(user)

      // Logout
      useAuthStore.getState().logout()
      expect(useAuthStore.getState().token).toBeNull()
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().refreshToken).toBeNull()
    })

    it('setAuth overwrites previous auth data', () => {
      const user1 = { id: '1', role: 'pcd' }
      const user2 = { id: '2', role: 'admin' }

      useAuthStore.getState().setAuth('token1', user1, 'refresh1', true)
      useAuthStore.getState().setAuth('token2', user2, 'refresh2', true)

      expect(useAuthStore.getState().token).toBe('token2')
      expect(useAuthStore.getState().user).toEqual(user2)
    })
  })
})
