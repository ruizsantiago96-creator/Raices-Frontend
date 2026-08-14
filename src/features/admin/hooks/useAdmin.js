import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

/* ═══════════════════════════════════════════════════════════════════
   Admin — Stats, Analytics, Alerts, Settings
   ═══════════════════════════════════════════════════════════════════ */

/** Helper: returns true only if the current user is an admin. */
const useIsAdmin = () => useAuthStore(s => s.user?.role === 'admin')

export function useAdminStats(opts) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/administracion/estadisticas').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminAnalytics(opts) {
  return useAdminStats(opts)
}

export function useNeedsIntelligence(opts) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'needs-intelligence'],
    queryFn: () => api.get('/administracion/inteligencia-necesidades').then(r => r.data),
    staleTime: 1000 * 60 * 10,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminAlerts(opts) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: () => api.get('/administracion/alertas').then(r => r.data),
    staleTime: 1000 * 60 * 2, // 2 min — las alertas deben estar relativamente frescas
    refetchOnWindowFocus: true,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminSettings(opts) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get('/administracion/configuracion').then(r => r.data),
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/administracion/configuracion', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  })
}

/* ═══════════════════════════════════════════════════════════════════
   Analytics Detail
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Mapea la respuesta de visitantes activos a un formato consistente.
 */
function mapActiveVisitors(raw) {
  if (!raw) return { live: 0, historialMinutos: [], promedioDiario: 0, promedioSemanal: 0, promedioMensual: 0 }
  const live = raw.personasActivas ?? raw.enVivo ?? raw.live ?? raw.activos ?? raw.active ?? 0
  const historialMinutos = raw.historialMinutos ?? raw.history ?? raw.timeline ?? []
  const promedioDiario = raw.promedioDiario ?? 0
  const promedioSemanal = raw.promedioSemanal ?? 0
  const promedioMensual = raw.promedioMensual ?? 0
  return { live, historialMinutos, promedioDiario, promedioSemanal, promedioMensual }
}

export function useAdminDetailedAnalytics(opts) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'detailed-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/administracion/analiticas')
      // Handle various response formats
      if (data?.datos) return data.datos
      if (data?.data) return data.data
      if (Array.isArray(data)) return data
      // If it's an object with metric properties, return as-is for the component to parse
      return data
    },
    staleTime: 1000 * 60 * 5,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminActiveUsersDetail(opts) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'active-users-detail'],
    queryFn: () => api.get('/administracion/visitantes-activos').then(r => mapActiveVisitors(r.data)),
    staleTime: 1000 * 30,
    retry: false,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

/* ═══════════════════════════════════════════════════════════════════
   Documentos de Identidad — Validación administrativa
   GET  /api/administracion/documentos-identidad/pendientes
   POST /api/administracion/documentos-identidad/:id/aprobar
   POST /api/administracion/documentos-identidad/:id/rechazar
   ═══════════════════════════════════════════════════════════════════ */

export function useAdminVerificaciones(filters = {}, opts) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'verificaciones', filters],
    queryFn: () => api.get('/administracion/documentos-identidad/pendientes', { params: filters }).then(r => r.data?.datos ?? r.data),
    staleTime: 1000 * 60 * 2,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAprobarVerificacion(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/administracion/documentos-identidad/${id}/aprobar`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'verificaciones'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useRechazarVerificacion(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post(`/administracion/documentos-identidad/${id}/rechazar`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'verificaciones'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

/* ═══════════════════════════════════════════════════════════════════
   NOTE: User management hooks have been moved to @features/users
   NOTE: Institution admin hooks have been moved to @features/institutions
   NOTE: Review admin hooks have been moved to @features/reviews
   ═══════════════════════════════════════════════════════════════════ */
