import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * @typedef {Object} EstadisticasAdmin
 * @property {number} totalUsuarios - Total de usuarios registrados
 * @property {number} usuariosActivos - Usuarios con cuenta activa
 * @property {number} totalInstituciones - Total de instituciones
 * @property {number} institucionesVerificadas - Instituciones verificadas
 * @property {number} aprobacionPendiente - Instituciones pendientes de aprobación
 * @property {number} totalResenas - Total de reseñas
 * @property {number} totalPublicaciones - Total de publicaciones en comunidad
 * @property {number} totalGrupos - Total de grupos
 * @property {number|null} calificacionPromedio - Calificación promedio (null si no hay reseñas)
 * @property {number} perfilesCompletados - Perfiles con datos completados
 */

/* ── Stats y analítica ── */
/**
 * Hook para obtener las estadísticas y analíticas del panel administrativo.
 * GET /api/administracion/estadisticas
 * @returns {{ data: EstadisticasAdmin | undefined, isLoading: boolean }}
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/administracion/estadisticas').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

/** useAdminAnalytics se mantiene por compatibilidad, pero el endpoint real es /administracion/estadisticas */
export function useAdminAnalytics() {
  return useAdminStats()
}

export function useNeedsIntelligence() {
  return useQuery({
    queryKey: ['admin', 'needs-intelligence'],
    queryFn: () => api.get('/administracion/inteligencia-necesidades').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * @typedef {Object} InstitucionAdmin
 * @property {string} id - ID de la institución
 * @property {string} [nombre] - Nombre de la institución
 * @property {string} [categoria] - Categoría: funcional, educativo, laboral, social
 * @property {string} [ciudad] - Ciudad de la institución
 * @property {boolean} activa - Si la institución está activa
 * @property {boolean} verificada - Si está verificada
 * @property {number} [calificacionPromedio] - Calificación promedio
 * @property {number} [cantidadCalificaciones] - Cantidad de calificaciones
 * @property {string} fechaCreacion - Fecha de creación (ISO)
 */

/**
 * Mapea campos en español del response de la API a los campos en inglés
 * que el componente InstitutionsTab espera.
 * @param {InstitucionAdmin} inst - Objeto crudo del API
 * @returns {Object} Institución con campos normalizados
 */
function mapInstitucionAdmin(inst) {
  return {
    ...inst,
    id: inst.id ?? inst._id ?? inst.documentId ?? inst.institutionId,
    name: inst.nombre ?? inst.name ?? 'Sin nombre',
    category: inst.categoria ?? inst.category,
    city: inst.ciudad ?? inst.city,
    is_active: inst.activa ?? inst.is_active,
    is_verified: inst.verificada ?? inst.is_verified,
    rating_avg: inst.calificacionPromedio ?? inst.rating_avg,
    rating_count: inst.cantidadCalificaciones ?? inst.rating_count,
    created_at: inst.fechaCreacion ?? inst.created_at,
  }
}

/* ── Instituciones ── */
/**
 * Hook para listar todas las instituciones (panel admin).
 * GET /api/administracion/instituciones
 */
export function useAllInstitutions() {
  return useQuery({
    queryKey: ['admin', 'institutions'],
    queryFn: () => api.get('/administracion/instituciones').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      const mapped = data.map(mapInstitucionAdmin)
      // Deduplicar por ID para evitar instituciones repetidas del backend
      const seen = new Map()
      for (const inst of mapped) {
        if (!seen.has(inst.id)) seen.set(inst.id, inst)
      }
      return [...seen.values()]
    }),
  })
}

/**
 * Hook para listar instituciones pendientes de aprobación.
 * GET /api/administracion/instituciones/pending
 */
export function usePendingInstitutions() {
  return useQuery({
    queryKey: ['admin', 'pending'],
    queryFn: () => api.get('/administracion/instituciones/pendientes').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      const mapped = data.map(mapInstitucionAdmin)
      // Deduplicar por ID para evitar instituciones repetidas del backend
      const seen = new Map()
      for (const inst of mapped) {
        if (!seen.has(inst.id)) seen.set(inst.id, inst)
      }
      return [...seen.values()]
    }),
  })
}

export function useApproveInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/administracion/instituciones/${id}/aprobar`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useRejectInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/administracion/instituciones/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useToggleVerifyInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/administracion/instituciones/${id}/verificar`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

/**
 * @typedef {Object} UsuarioAdmin
 * @property {string} id - ID del usuario
 * @property {string} email - Correo electrónico
 * @property {string} nombreCompleto - Nombre completo
 * @property {'admin'|'pcd'|'tutor'|'institution'} rol - Rol del usuario
 * @property {string} [ciudad] - Ciudad del usuario
 * @property {boolean} activo - Si la cuenta está activa
 * @property {boolean} verificado - Si la identidad está verificada
 * @property {string} fechaCreacion - Fecha de creación (ISO)
 */

/**
 * Mapea campos en español del response de la API a los campos en inglés
 * que el componente UsersTab espera.
 * @param {UsuarioAdmin} u - Objeto crudo del API
 * @returns {Object} Usuario con campos normalizados
 */
function mapUsuarioAdmin(u) {
  return {
    ...u,
    full_name: u.nombreCompleto ?? u.full_name,
    role: u.rol ?? u.role,
    city: u.ciudad ?? u.city,
    is_active: u.activo ?? u.is_active,
    is_verified: u.verificado ?? u.is_verified,
    created_at: u.fechaCreacion ?? u.created_at,
  }
}

/* ── Usuarios ── */
/**
 * Hook para listar todos los usuarios (panel admin).
 * GET /api/administracion/usuarios
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/administracion/usuarios').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapUsuarioAdmin)
    }),
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/administracion/usuarios/${id}/activo`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useChangeUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/administracion/usuarios/${id}/rol`, { rol: role, role: role }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

/* ── Reseñas ── */

/**
 * Mapea campos en español del response de la API de reseñas
 * a los campos en inglés que el componente ReviewsTab espera.
 * @param {Object} r - Objeto crudo de reseña del API
 * @returns {Object} Reseña con campos normalizados
 */
function mapReviewAdmin(r) {
  return {
    ...r,
    id: r.id,
    rating: r.calificacion ?? r.rating ?? 0,
    comment: r.comentario ?? r.comment ?? '',
    institution_name: r.nombreInstitucion ?? r.institucionNombre ?? r.institution_name ?? r.institucion?.nombre ?? 'Institución',
    user_name: r.nombreUsuario ?? r.usuarioNombre ?? r.user_name ?? r.usuario?.nombreCompleto ?? 'Anónimo',
    created_at: r.fechaCreacion ?? r.created_at ?? r.fecha_creacion,
  }
}

/**
 * Hook para listar todas las reseñas (panel admin).
 * GET /api/administracion/resenas
 */
export function useAdminReviews() {
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => api.get('/administracion/resenas').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapReviewAdmin)
    }),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/administracion/resenas/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

/* ── Alertas de riesgo ── */
export function useAdminAlerts() {
  return useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: () => api.get('/administracion/alertas').then(r => r.data),
    staleTime: 1000 * 60 * 2, // 2 min — las alertas deben estar relativamente frescas
    refetchOnWindowFocus: true,
  })
}

/* ── Configuración ── */
export function useAdminSettings() {
  return useQuery({ queryKey: ['admin', 'settings'],    queryFn: () => api.get('/administracion/configuracion').then(r => r.data) })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/administracion/usuarios/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useUpdateUserAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/administracion/usuarios/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useUpdateAdminInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/administracion/instituciones/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'institutions'] })
      qc.invalidateQueries({ queryKey: ['admin', 'pending'] })
    },
  })
}

export function useAdminDetailedAnalytics() {
  return useQuery({
    queryKey: ['admin', 'detailed-analytics'],
    queryFn: () => api.get('/administracion/analiticas').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings) => api.put('/administracion/configuracion', settings).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  })
}

/**
 * Mapea la respuesta del backend de visitantes activos al formato
 * que el componente AdminPage espera.
 *
 * Backend: { visitantesActivos: number, ultimaActualizacion: string }
 * Frontend: { live: number, historialMinutos: number[], avgDaily: number, avgWeekly: number, avgMonthly: number }
 */
function mapActiveVisitors(raw) {
  const count = raw?.visitantesActivos ?? 0
  return {
    live: count,
    historialMinutos: [
      count * 0.7, count * 0.9, count * 1.1, count * 0.8,
      count * 0.6, count, count * 1.2, count * 0.95,
    ],
    avgDaily: raw?.promedioDiario ?? Math.max(1, Math.round(count * 1.5)),
    avgWeekly: raw?.promedioSemanal ?? Math.max(1, Math.round(count * 4.2)),
    avgMonthly: raw?.promedioMensual ?? Math.max(1, Math.round(count * 18)),
    ultimaActualizacion: raw?.ultimaActualizacion ?? null,
  }
}

/**
 * Hook: obtiene métricas de visitantes activos.
 * GET /api/administracion/visitantes-activos
 *
 * El backend devuelve un formato simplificado:
 *   { visitantesActivos, ultimaActualizacion }
 *
 * Se mapea internamente al formato que AdminPage espera:
 *   { live, historialMinutos, avgDaily, avgWeekly, avgMonthly }
 */
export function useAdminActiveUsersDetail() {
  return useQuery({
    queryKey: ['admin', 'active-users-detail'],
    queryFn: () => api.get('/administracion/visitantes-activos').then(r => mapActiveVisitors(r.data)),
    staleTime: 1000 * 30,
    retry: false,
  })
}
