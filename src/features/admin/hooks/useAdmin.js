import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/* ── Stats y analítica ── */
export function useAdminStats() {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: () => api.get('/admin/stats').then(r => r.data) })
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useNeedsIntelligence() {
  return useQuery({
    queryKey: ['admin', 'needs-intelligence'],
    queryFn: () => api.get('/admin/needs-intelligence').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

/* ── Instituciones ── */
export function useAllInstitutions() {
  return useQuery({ queryKey: ['admin', 'institutions'], queryFn: () => api.get('/admin/institutions').then(r => r.data) })
}

export function usePendingInstitutions() {
  return useQuery({ queryKey: ['admin', 'pending'], queryFn: () => api.get('/admin/institutions/pending').then(r => r.data) })
}

export function useApproveInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/admin/institutions/${id}/approve`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useRejectInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/institutions/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useToggleVerifyInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/institutions/${id}/verify`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

/* ── Usuarios ── */
export function useAdminUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: () => api.get('/admin/users').then(r => r.data) })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/active`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useChangeUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

/* ── Reseñas ── */
export function useAdminReviews() {
  return useQuery({ queryKey: ['admin', 'reviews'], queryFn: () => api.get('/admin/reviews').then(r => r.data) })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/reviews/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

/* ── Alertas de riesgo ── */
export function useAdminAlerts() {
  return useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: () => api.get('/admin/alerts').then(r => r.data),
    staleTime: 1000 * 60 * 2, // 2 min — las alertas deben estar relativamente frescas
    refetchOnWindowFocus: true,
  })
}

/* ── Configuración ── */
export function useAdminSettings() {
  return useQuery({ queryKey: ['admin', 'settings'], queryFn: () => api.get('/admin/settings').then(r => r.data) })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings) => api.put('/admin/settings', settings).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  })
}
