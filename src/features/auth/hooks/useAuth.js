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
        const raw = await api.post('/autenticacion/inicio-sesion', { email, password }).then(r => r.data)
        // Mapear respuesta del backend (español) al formato interno
        const data = {
          token: raw.tokenAcceso,
          refreshToken: raw.tokenRefresco ?? null,
          user: raw.usuario ? {
            id: raw.usuario.id,
            email: raw.usuario.email,
            role: raw.usuario.rol,
            full_name: raw.usuario.nombreCompleto,
          } : undefined,
        }
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
      const token = data.token
      const refresh = data.refreshToken ?? null

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
    mutationFn: ({ _rememberMe, full_name, role, city, state, ...rest }) => {
      const body = {
        ...rest,
        nombreCompleto: full_name,
        rol: role,
        ciudad: city,
        estado: state,
      }
      return api.post('/autenticacion/registro', body).then(r => r.data)
    },
    onSuccess: (raw, variables) => {
      const token = raw.tokenAcceso
      const refresh = raw.tokenRefresco ?? null
      const rememberMe = variables?._rememberMe ?? true
      const user = raw.usuario ? {
        id: raw.usuario.id,
        email: raw.usuario.email,
        role: raw.usuario.rol,
        full_name: raw.usuario.nombreCompleto,
      } : undefined
      console.log('[Auth] Register response:', { token: !!token, hasRefreshToken: !!refresh, rememberMe, role: user?.role })
      setRememberMe(rememberMe)
      setAuth(token, user, refresh, rememberMe)
      console.log('[Auth] Register - saved to storage:', {
        hasToken: !!token,
        hasRefreshToken: !!refresh,
        storageType: rememberMe ? 'localStorage' : 'sessionStorage',
      })
      const role = user?.role
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
    queryFn: () => api.get('/autenticacion/yo').then(r => {
      const d = r.data
      return {
        id: d.id,
        email: d.email,
        role: d.rol,
        full_name: d.nombreCompleto,
        city: d.ciudad,
        state: d.estado,
        avatar_url: d.urlAvatar,
        is_verified: d.verificado,
      }
    }),
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
