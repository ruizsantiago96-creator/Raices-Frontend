import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getRememberMe,
  setRememberMe,
  saveToken,
  getRefreshToken,
  saveRefreshToken,
  getToken,
  getUser,
  saveUser,
  clearAllAuth,
} from '../storage'

// Mock console.log to suppress noise from storage.js
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('shared/lib/storage', () => {
  // ═══════════════════════════════════════════════════════════════
  // getRememberMe / setRememberMe
  // ═══════════════════════════════════════════════════════════════
  describe('getRememberMe / setRememberMe', () => {
    it('returns false when no preference is stored', () => {
      expect(getRememberMe()).toBe(false)
    })

    it('returns true after setting to true', () => {
      setRememberMe(true)
      expect(getRememberMe()).toBe(true)
    })

    it('returns false after setting to false', () => {
      setRememberMe(true)
      setRememberMe(false)
      expect(getRememberMe()).toBe(false)
    })

    it('always stores in localStorage (persists across sessions)', () => {
      setRememberMe(true)
      expect(localStorage.getItem('raices_remember')).toBe('true')
    })

    it('handles falsy values (null, undefined, 0) by storing "false"', () => {
      setRememberMe(null)
      expect(getRememberMe()).toBe(false)
      setRememberMe(undefined)
      expect(getRememberMe()).toBe(false)
      setRememberMe(0)
      expect(getRememberMe()).toBe(false)
    })

    it('treats any truthy value as true', () => {
      setRememberMe('yes')
      expect(getRememberMe()).toBe(true)
      setRememberMe(1)
      expect(getRememberMe()).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // saveToken / getToken
  // ═══════════════════════════════════════════════════════════════
  describe('saveToken / getToken', () => {
    it('saves token to localStorage when rememberMe=true', () => {
      saveToken('test-token', true)
      expect(localStorage.getItem('raices_token')).toBe('test-token')
    })

    it('saves token to sessionStorage when rememberMe=false', () => {
      saveToken('test-token', false)
      expect(sessionStorage.getItem('raices_token')).toBe('test-token')
    })

    it('clears token from the other storage when saving', () => {
      // Put token in both storages first
      localStorage.setItem('raices_token', 'old-token')
      sessionStorage.setItem('raices_token', 'old-token')

      saveToken('new-token', true)
      expect(localStorage.getItem('raices_token')).toBe('new-token')
      expect(sessionStorage.getItem('raices_token')).toBeNull()
    })

    it('getToken reads from localStorage first, then sessionStorage', () => {
      // No token stored
      expect(getToken()).toBeNull()

      // Store in sessionStorage only
      sessionStorage.setItem('raices_token', 'session-token')
      expect(getToken()).toBe('session-token')

      // Store in localStorage too — localStorage wins
      localStorage.setItem('raices_token', 'local-token')
      expect(getToken()).toBe('local-token')
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // saveRefreshToken / getRefreshToken
  // ═══════════════════════════════════════════════════════════════
  describe('saveRefreshToken / getRefreshToken', () => {
    it('saves refresh token when value is truthy', () => {
      saveRefreshToken('refresh-123', true)
      expect(localStorage.getItem('raices_refresh')).toBe('refresh-123')
    })

    it('does not save when refresh token is falsy (empty string)', () => {
      saveRefreshToken('', true)
      expect(localStorage.getItem('raices_refresh')).toBeNull()
    })

    it('does not save when refresh token is null', () => {
      saveRefreshToken(null, true)
      expect(localStorage.getItem('raices_refresh')).toBeNull()
    })

    it('getRefreshToken reads from localStorage first, then sessionStorage', () => {
      expect(getRefreshToken()).toBeNull()

      sessionStorage.setItem('raices_refresh', 'session-refresh')
      expect(getRefreshToken()).toBe('session-refresh')

      localStorage.setItem('raices_refresh', 'local-refresh')
      expect(getRefreshToken()).toBe('local-refresh')
    })

    it('clears refresh token from the other storage', () => {
      sessionStorage.setItem('raices_refresh', 'old-refresh')
      saveRefreshToken('new-refresh', true)
      expect(sessionStorage.getItem('raices_refresh')).toBeNull()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // saveUser / getUser
  // ═══════════════════════════════════════════════════════════════
  describe('saveUser / getUser', () => {
    const mockUser = { id: '1', email: 'test@test.com', role: 'pcd' }

    it('saves user as JSON to localStorage when rememberMe=true', () => {
      saveUser(mockUser, true)
      const stored = JSON.parse(localStorage.getItem('raices_user'))
      expect(stored).toEqual(mockUser)
    })

    it('saves user as JSON to sessionStorage when rememberMe=false', () => {
      saveUser(mockUser, false)
      const stored = JSON.parse(sessionStorage.getItem('raices_user'))
      expect(stored).toEqual(mockUser)
    })

    it('does not save when user is null', () => {
      saveUser(null, true)
      expect(localStorage.getItem('raices_user')).toBeNull()
    })

    it('does not save when user is undefined', () => {
      saveUser(undefined, true)
      expect(localStorage.getItem('raices_user')).toBeNull()
    })

    it('getUser returns parsed user from localStorage', () => {
      saveUser(mockUser, true)
      expect(getUser()).toEqual(mockUser)
    })

    it('getUser returns parsed user from sessionStorage', () => {
      saveUser(mockUser, false)
      expect(getUser()).toEqual(mockUser)
    })

    it('getUser returns null when no user is stored', () => {
      expect(getUser()).toBeNull()
    })

    it('getUser returns null when stored JSON is corrupted', () => {
      localStorage.setItem('raices_user', 'invalid-json{')
      expect(getUser()).toBeNull()
    })

    it('getUser prefers localStorage over sessionStorage', () => {
      localStorage.setItem('raices_user', JSON.stringify({ id: 'local' }))
      sessionStorage.setItem('raices_user', JSON.stringify({ id: 'session' }))
      expect(getUser()).toEqual({ id: 'local' })
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // clearAllAuth
  // ═══════════════════════════════════════════════════════════════
  describe('clearAllAuth', () => {
    it('removes all auth data from both storages', () => {
      saveToken('token', true)
      saveRefreshToken('refresh', true)
      saveUser({ id: '1' }, true)

      sessionStorage.setItem('raices_token', 'session-token')
      sessionStorage.setItem('raices_refresh', 'session-refresh')

      clearAllAuth()

      expect(getToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
      expect(getUser()).toBeNull()
      expect(sessionStorage.getItem('raices_token')).toBeNull()
      expect(sessionStorage.getItem('raices_refresh')).toBeNull()
    })

    it('does NOT remove raices_remember preference', () => {
      setRememberMe(true)
      saveToken('token', true)

      clearAllAuth()

      expect(getRememberMe()).toBe(true)
    })

    it('removes legacy raices_auth key from localStorage', () => {
      localStorage.setItem('raices_auth', 'old-data')
      clearAllAuth()
      expect(localStorage.getItem('raices_auth')).toBeNull()
    })

    it('is safe to call when nothing is stored', () => {
      expect(() => clearAllAuth()).not.toThrow()
    })
  })
})
