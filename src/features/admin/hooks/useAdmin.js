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
    queryFn: () => api.get('/admin/needs-intelligence').then(r => r.data),
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
      return data.map(mapInstitucionAdmin)
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
    queryFn: () => api.get('/administracion/instituciones/pending').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapInstitucionAdmin)
    }),
  })
}

export function useApproveInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/administracion/instituciones/${id}/approve`).then(r => r.data),
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
    mutationFn: (id) => api.patch(`/administracion/instituciones/${id}/verify`).then(r => r.data),
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
    mutationFn: ({ id, role }) => api.patch(`/administracion/usuarios/${id}/rol`, { rol: role }).then(r => r.data),
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
