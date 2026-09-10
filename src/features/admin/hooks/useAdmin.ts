import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import type {
  AdminStats,
  NeedsIntelligenceData,
  AdminAlert,
  AdminSettings,
  ActiveVisitorsDetail,
  RawActiveVisitors,
  DocumentoIdentidadAdmin,
  RechazarVerificacionPayload,
  VerificacionesFilters,
  AuditoriaLog,
  AuditoriaStats,
  AuditoriaFilters,
} from '@/types/admin'

/* ═══════════════════════════════════════════════════════════════════
   Admin — Stats, Analytics, Alerts, Settings
   ═══════════════════════════════════════════════════════════════════ */

/** Helper: returns true only if the current user is an admin. */
const useIsAdmin = () => useAuthStore(s => s.user?.role === 'admin')

export function useAdminStats(opts?: Omit<UseQueryOptions<AdminStats>, 'queryKey' | 'queryFn'>) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/administracion/estadisticas').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminAnalytics(opts?: Omit<UseQueryOptions<AdminStats>, 'queryKey' | 'queryFn'>) {
  return useAdminStats(opts)
}

export function useNeedsIntelligence(opts?: Omit<UseQueryOptions<NeedsIntelligenceData>, 'queryKey' | 'queryFn'>) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery<NeedsIntelligenceData>({
    queryKey: ['admin', 'needs-intelligence'],
    queryFn: () => api.get('/administracion/inteligencia-necesidades').then(r => r.data),
    staleTime: 1000 * 60 * 10,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminAlerts(opts?: Omit<UseQueryOptions<AdminAlert[]>, 'queryKey' | 'queryFn'>) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery<AdminAlert[]>({
    queryKey: ['admin', 'alerts'],
    queryFn: () => api.get('/administracion/alertas').then(r => r.data),
    staleTime: 1000 * 60 * 2, // 2 min — las alertas deben estar relativamente frescas
    refetchOnWindowFocus: true,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminSettings(opts?: Omit<UseQueryOptions<AdminSettings>, 'queryKey' | 'queryFn'>) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery<AdminSettings>({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get('/administracion/configuracion').then(r => r.data),
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AdminSettings>) => api.put('/administracion/configuracion', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  })
}

/* ═══════════════════════════════════════════════════════════════════
   Analytics Detail
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Mapea la respuesta de visitantes activos a un formato consistente.
 */
function mapActiveVisitors(raw?: RawActiveVisitors): ActiveVisitorsDetail {
  if (!raw) return { live: 0, historialMinutos: [], promedioDiario: 0, promedioSemanal: 0, promedioMensual: 0 }
  const live = raw.personasActivas ?? raw.enVivo ?? raw.live ?? raw.activos ?? raw.active ?? 0
  const historialMinutos = raw.historialMinutos ?? raw.history ?? raw.timeline ?? []
  const promedioDiario = raw.promedioDiario ?? 0
  const promedioSemanal = raw.promedioSemanal ?? 0
  const promedioMensual = raw.promedioMensual ?? 0
  return { live, historialMinutos, promedioDiario, promedioSemanal, promedioMensual }
}

export function useAdminDetailedAnalytics(opts?: Omit<UseQueryOptions<Record<string, unknown>>, 'queryKey' | 'queryFn'>) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery<Record<string, unknown>>({
    queryKey: ['admin', 'detailed-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/administracion/analiticas')
      // Handle various response formats
      if (data?.datos) return data.datos
      if (data?.data) return data.data
      return data
    },
    staleTime: 1000 * 60 * 5,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminActiveUsersDetail(opts?: Omit<UseQueryOptions<ActiveVisitorsDetail>, 'queryKey' | 'queryFn'>) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery<ActiveVisitorsDetail>({
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

   ⚠️ Contrato real del backend (Swagger):
   - El endpoint devuelve SOLO documentos pendientes (no acepta `estado`).
   - Params soportados: pagina (1), limite (20), ordenarPor (fechaCreacion),
     direccion (asc|desc), buscar. Enviar params no documentados → 500.
   - Respuesta: { datos: DocumentoIdentidadAdmin[], total, pagina?, limite? }
   ═══════════════════════════════════════════════════════════════════ */

export function useAdminVerificaciones(
  filters: VerificacionesFilters = {},
  opts?: Omit<UseQueryOptions<DocumentoIdentidadAdmin[]>, 'queryKey' | 'queryFn'>
) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  // Solo enviar los params que el backend declara en Swagger; filtrar vacíos
  // para no mandar claves con `undefined` ni params de nivel UI.
  const { estado: _estado, tipo: _tipo, rol: _rol, ...paramsValidos } = filters
  const params = Object.fromEntries(
    Object.entries(paramsValidos).filter(([, v]) => v !== undefined && v !== '')
  )
  return useQuery<DocumentoIdentidadAdmin[]>({
    // ⚠️ Key solo con primitivos — un objeto inline crea referencia nueva en
    // cada render y dispara refetches infinitos.
    queryKey: ['admin', 'verificaciones', params.pagina ?? null, params.limite ?? null, params.ordenarPor ?? null, params.direccion ?? null, params.buscar ?? null],
    queryFn: () =>
      api
        .get('/administracion/documentos-identidad/pendientes', { params })
        .then(r => {
          const data = r.data
          // Respuesta paginada { datos, total } o lista plana (compatibilidad)
          if (Array.isArray(data)) return data as DocumentoIdentidadAdmin[]
          if (Array.isArray(data?.datos)) return data.datos as DocumentoIdentidadAdmin[]
          return []
        }),
    staleTime: 1000 * 60 * 2,
    // 🛡️ Anti-bucle: los errores del backend (500) no deben re-disparar peticiones.
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAprobarVerificacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.post(`/administracion/documentos-identidad/${id}/aprobar`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'verificaciones'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useRechazarVerificacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: RechazarVerificacionPayload) =>
      api.post(`/administracion/documentos-identidad/${id}/rechazar`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'verificaciones'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

/* ═══════════════════════════════════════════════════════════════════
   Auditoría — Logs de administración
   GET  /api/administracion/auditoria
   GET  /api/administracion/auditoria/estadisticas
   ═══════════════════════════════════════════════════════════════════ */

export function useAdminAuditoria(
  filters: AuditoriaFilters = {},
  opts?: Omit<UseQueryOptions<AuditoriaLog[]>, 'queryKey' | 'queryFn'>
) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  // Normalizar a los params documentados: pagina, limite, usuarioId, accion,
  // recurso, fechaDesde, fechaHasta. Mapear alias legacy y filtrar vacíos.
  const { desde, hasta, ...rest } = filters
  const params = Object.fromEntries(
    Object.entries({
      ...rest,
      fechaDesde: rest.fechaDesde ?? desde,
      fechaHasta: rest.fechaHasta ?? hasta,
    }).filter(([, v]) => v !== undefined && v !== '')
  )
  return useQuery<AuditoriaLog[]>({
    // ⚠️ Key solo con primitivos — un objeto inline crea referencia nueva en
    // cada render y dispara refetches infinitos.
    queryKey: ['admin', 'auditoria', params.pagina ?? null, params.limite ?? null, params.usuarioId ?? null, params.accion ?? null, params.recurso ?? null, params.fechaDesde ?? null, params.fechaHasta ?? null],
    queryFn: () =>
      api
        .get('/administracion/auditoria', { params })
        .then(r => {
          const data = r.data
          // Respuesta paginada { datos, total, ... } o lista plana (compatibilidad)
          if (Array.isArray(data)) return data as AuditoriaLog[]
          if (Array.isArray(data?.datos)) return data.datos as AuditoriaLog[]
          if (Array.isArray(data?.data)) return data.data as AuditoriaLog[]
          return []
        }),
    staleTime: 1000 * 60 * 2,
    // 🛡️ Anti-bucle: un 500 del backend no debe re-disparar peticiones en loop.
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAdminAuditoriaStats(opts?: Omit<UseQueryOptions<AuditoriaStats>, 'queryKey' | 'queryFn'>) {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery<AuditoriaStats>({
    queryKey: ['admin', 'auditoria-stats'],
    queryFn: () => api.get('/administracion/auditoria/estadisticas').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}
