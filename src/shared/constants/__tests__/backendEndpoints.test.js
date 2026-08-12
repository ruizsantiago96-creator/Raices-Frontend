import { describe, it, expect } from 'vitest'
import {
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  DEPENDENT_ENDPOINTS,
  INSTITUTION_ENDPOINTS,
  DISCOVERY_ENDPOINTS,
  REVIEW_ENDPOINTS,
  FAVORITE_ENDPOINTS,
  COMMUNITY_ENDPOINTS,
  MESSAGE_ENDPOINTS,
  JOB_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  AI_ENDPOINTS,
  CATALOG_ENDPOINTS,
  ADMIN_ENDPOINTS,
  ALL_ENDPOINTS,
  getEndpointInfo,
} from '../backendEndpoints'

describe('shared/constants/backendEndpoints', () => {
  // ═══════════════════════════════════════════════════════════════
  // All endpoint groups exist and have expected shape
  // ═══════════════════════════════════════════════════════════════
  const endpointGroups = [
    { name: 'AUTH_ENDPOINTS', obj: AUTH_ENDPOINTS },
    { name: 'USER_ENDPOINTS', obj: USER_ENDPOINTS },
    { name: 'DEPENDENT_ENDPOINTS', obj: DEPENDENT_ENDPOINTS },
    { name: 'INSTITUTION_ENDPOINTS', obj: INSTITUTION_ENDPOINTS },
    { name: 'DISCOVERY_ENDPOINTS', obj: DISCOVERY_ENDPOINTS },
    { name: 'REVIEW_ENDPOINTS', obj: REVIEW_ENDPOINTS },
    { name: 'FAVORITE_ENDPOINTS', obj: FAVORITE_ENDPOINTS },
    { name: 'COMMUNITY_ENDPOINTS', obj: COMMUNITY_ENDPOINTS },
    { name: 'MESSAGE_ENDPOINTS', obj: MESSAGE_ENDPOINTS },
    { name: 'JOB_ENDPOINTS', obj: JOB_ENDPOINTS },
    { name: 'NOTIFICATION_ENDPOINTS', obj: NOTIFICATION_ENDPOINTS },
    { name: 'AI_ENDPOINTS', obj: AI_ENDPOINTS },
    { name: 'CATALOG_ENDPOINTS', obj: CATALOG_ENDPOINTS },
    { name: 'ADMIN_ENDPOINTS', obj: ADMIN_ENDPOINTS },
  ]

  endpointGroups.forEach(({ name, obj }) => {
    describe(name, () => {
      it('is defined and is an object', () => {
        expect(obj).toBeDefined()
        expect(typeof obj).toBe('object')
      })

      it('has at least one endpoint', () => {
        expect(Object.keys(obj).length).toBeGreaterThan(0)
      })

      it('every endpoint has method and path', () => {
        Object.values(obj).forEach((ep) => {
          expect(ep.method).toBeDefined()
          expect(ep.path).toBeDefined()
          expect(typeof ep.method).toBe('string')
          expect(typeof ep.path).toBe('string')
        })
      })
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // ALL_ENDPOINTS is the union of all groups
  // ═══════════════════════════════════════════════════════════════
  describe('ALL_ENDPOINTS', () => {
    it('is defined and is an object', () => {
      expect(ALL_ENDPOINTS).toBeDefined()
      expect(typeof ALL_ENDPOINTS).toBe('object')
    })

    it('contains all keys from AUTH_ENDPOINTS', () => {
      Object.keys(AUTH_ENDPOINTS).forEach((key) => {
        expect(ALL_ENDPOINTS[key]).toBeDefined()
      })
    })

    it('contains all keys from ADMIN_ENDPOINTS', () => {
      Object.keys(ADMIN_ENDPOINTS).forEach((key) => {
        expect(ALL_ENDPOINTS[key]).toBeDefined()
      })
    })

    it('contains at least 40 endpoints total (sum of all groups)', () => {
      expect(Object.keys(ALL_ENDPOINTS).length).toBeGreaterThanOrEqual(40)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // getEndpointInfo
  // ═══════════════════════════════════════════════════════════════
  describe('getEndpointInfo', () => {
    it('returns endpoint object for valid key', () => {
      const ep = getEndpointInfo('LOGIN')
      expect(ep).toBeDefined()
      expect(ep.method).toBe('POST')
      expect(ep.path).toBe('/autenticacion/inicio-sesion')
    })

    it('returns null for non-existent key', () => {
      expect(getEndpointInfo('NONEXISTENT')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(getEndpointInfo('')).toBeNull()
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // Specific endpoint validation
  // ═══════════════════════════════════════════════════════════════
  describe('specific endpoints', () => {
    it('AUTH_ENDPOINTS.LOGIN has correct shape', () => {
      const ep = AUTH_ENDPOINTS.LOGIN
      expect(ep.method).toBe('POST')
      expect(ep.path).toBe('/autenticacion/inicio-sesion')
      expect(ep.body).toBeDefined()
      expect(ep.response).toBeDefined()
    })

    it('USER_ENDPOINTS.GET_PROFILE uses GET method', () => {
      expect(USER_ENDPOINTS.GET_PROFILE.method).toBe('GET')
    })

    it('JOB_ENDPOINTS.APPLY has body with cartaPresentacion', () => {
      expect(JOB_ENDPOINTS.APPLY.body.cartaPresentacion).toBe('string?')
    })

    it('NOTIFICATION_ENDPOINTS.MARK_READ uses PATCH method', () => {
      expect(NOTIFICATION_ENDPOINTS.MARK_READ.method).toBe('PATCH')
    })

    it('AI_ENDPOINTS.CHAT path matches expected', () => {
      expect(AI_ENDPOINTS.CHAT.path).toBe('/ia/conversacion')
    })
  })
})
