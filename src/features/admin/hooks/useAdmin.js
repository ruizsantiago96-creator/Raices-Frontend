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
    queryFn: () => api.get('/administracion/instituciones/pendientes').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapInstitucionAdmin)
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
export function useAdminReviews() {
  return useQuery({ queryKey: ['admin', 'reviews'], queryFn: () => api.get('/administracion/resenas').then(r => {
    const res = r.data
    return Array.isArray(res) ? res : (res?.datos ?? [])
  }) })
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

export function useAdminActiveUsersDetail() {
  return useQuery({
    queryKey: ['admin', 'active-users-detail'],
    queryFn: () => api.get('/administracion/visitantes-activos').then(r => r.data),
    staleTime: 1000 * 30, // Refrescar cada 30 segundos
    retry: false,
  })
}
