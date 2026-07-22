import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useAuthStore } from '../store/authStore'
import { setRememberMe } from '@shared/lib/storage'
import { firebaseBridgeLogin, isBridgeAvailable } from '../lib/firebaseBridge'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  return useMutation({
    mutationFn: async ({ _rememberMe, email, password }) => {
      const rememberMe = _rememberMe ?? true

      // ── Intento 1: Login contra nuestro backend ──────────────────
      try {
        const data = await api.post('/auth/login', { email, password }).then(r => r.data)
        return { source: 'backend', data, rememberMe }
      } catch (err) {
        // ── Solo interceptamos 401 y solo si el bridge está habilitado ──
        if (err.response?.status !== 401 || !isBridgeAvailable()) {
          throw err
        }

        console.log('[Auth] Backend devolvió 401 — intentando puente con Firebase…')

        // ── Intento 2: Puente Firebase REST API ────────────────────
        const { idToken, profile } = await firebaseBridgeLogin(email, password)

        console.log('[Auth] Puente Firebase exitoso — token obtenido ✓')

        return {
          source: 'firebase-bridge',
          data: {
            token: idToken,
            user: profile,
            refreshToken: null,
          },
          rememberMe,
        }
      }
    },
    onSuccess: (result, variables) => {
      const { source, data, rememberMe } = result
      const token = data.token ?? data.access_token
      const refresh = data.refreshToken ?? data.refresh_token

      console.log('[Auth] Login response:', { source, token: !!token, hasRefreshToken: !!refresh, rememberMe, role: data.user?.role })

      setRememberMe(rememberMe)
      setAuth(token, data.user, refresh, rememberMe)

      console.log('[Auth] Saved to storage:', {
        hasToken: !!token,
        hasRefreshToken: !!refresh,
        storageType: rememberMe ? 'localStorage' : 'sessionStorage',
      })

      const role = data.user?.role
      if (role === 'admin') nav('/admin')
      else if (role === 'institution') nav('/institution-portal')
      else nav('/dashboard')
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  return useMutation({
    mutationFn: ({ _rememberMe, ...data }) => api.post('/auth/register', data).then(r => r.data),
    onSuccess: (data, variables) => {
      const token = data.token ?? data.access_token
      const refresh = data.refreshToken ?? data.refresh_token
      const rememberMe = variables?._rememberMe ?? true
      console.log('[Auth] Register response:', { token: !!token, hasRefreshToken: !!refresh, rememberMe, role: data.user?.role })
      setRememberMe(rememberMe)
      setAuth(token, data.user, refresh, rememberMe)
      console.log('[Auth] Register - saved to storage:', {
        hasToken: !!token,
        hasRefreshToken: !!refresh,
        storageType: rememberMe ? 'localStorage' : 'sessionStorage',
      })
      const role = data.user?.role
      if (role === 'admin') nav('/admin')
      else if (role === 'institution') nav('/institution-portal')
      else nav('/dashboard')
    },
  })
}

export function useMe() {
  const { token } = useAuthStore()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
    enabled: !!token,
  })
}

export function useProfile() {
  const { token } = useAuthStore()
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/profile').then(r => r.data),
    enabled: !!token,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/users/profile', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
