import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { setRememberMe } from '../lib/storage'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  return useMutation({
    mutationFn: ({ _rememberMe, ...data }) => api.post('/auth/login', data).then(r => r.data),
    onSuccess: (data, variables) => {
      const token = data.token ?? data.access_token
      const refresh = data.refreshToken ?? data.refresh_token
      const rememberMe = variables?._rememberMe ?? true

      console.log('[Auth] Login response:', { token: !!token, hasRefreshToken: !!refresh, rememberMe, role: data.user?.role })

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
