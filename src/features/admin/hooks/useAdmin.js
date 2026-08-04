import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/* ═══════════════════════════════════════════════════════════════════
   Admin — Stats, Analytics, Alerts, Settings
   ═══════════════════════════════════════════════════════════════════ */

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/administracion/estadisticas').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminAnalytics() {
  return useAdminStats()
}

export function useNeedsIntelligence() {
  return useQuery({
    queryKey: ['admin', 'needs-intelligence'],
    queryFn: () => api.get('/administracion/necesidades-inteligencia').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  })
}

export function useAdminAlerts() {
  return useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: () => api.get('/administracion/alertas').then(r => r.data),
    staleTime: 1000 * 60 * 2, // 2 min — las alertas deben estar relativamente frescas
    refetchOnWindowFocus: true,
  })
}

export function useAdminSettings() {
  return useQuery({ queryKey: ['admin', 'settings'],    queryFn: () => api.get('/administracion/configuracion').then(r => r.data) })
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

export function useAdminDetailedAnalytics() {
  return useQuery({
    queryKey: ['admin', 'detailed-analytics'],
    queryFn: () => api.get('/administracion/analiticas').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminActiveUsersDetail() {
  return useQuery({
    queryKey: ['admin', 'active-users-detail'],
    queryFn: () => api.get('/administracion/visitantes-activos').then(r => mapActiveVisitors(r.data)),
    staleTime: 1000 * 30,
    retry: false,
  })
}

/* ═══════════════════════════════════════════════════════════════════
   NOTE: User management hooks have been moved to @features/users
   NOTE: Institution admin hooks have been moved to @features/institutions
   NOTE: Review admin hooks have been moved to @features/reviews
   ═══════════════════════════════════════════════════════════════════ */
