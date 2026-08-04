import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

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
    email: inst.email ?? inst.emailContacto ?? inst.correo ?? inst.correoElectronico,
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

export function useUpdateAdminInstitution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/administracion/instituciones/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}
