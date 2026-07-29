import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * Normaliza los campos de reseña del backend (español) a los campos
 * en inglés que los componentes esperan.
 * @param {Object} r - Objeto crudo de reseña del API
 * @returns {Object} Reseña con campos normalizados
 */
function mapReview(r) {
  return {
    ...r,
    rating: r.calificacion ?? r.rating ?? 0,
    comment: r.comentario ?? r.comment ?? '',
    full_name: r.nombreUsuario ?? r.usuarioNombre ?? r.full_name ?? r.usuario?.nombreCompleto ?? 'Anónimo',
    user_name: r.nombreUsuario ?? r.usuarioNombre ?? r.user_name ?? r.usuario?.nombreCompleto ?? 'Anónimo',
    reviewer_name: r.nombreUsuario ?? r.usuarioNombre ?? r.reviewer_name ?? r.usuario?.nombreCompleto ?? 'Anónimo',
    user_id: r.usuarioId ?? r.usuario_id ?? r.user_id,
    institution_name: r.nombreInstitucion ?? r.institucionNombre ?? r.institution_name ?? r.institucion?.nombre,
    created_at: r.fechaCreacion ?? r.created_at ?? r.fecha_creacion,
  }
}

export function useReviews(institutionId) {
  return useQuery({
    queryKey: ['reviews', institutionId],
    queryFn: () => api.get(`/resenas/institucion/${institutionId}`, { params: { pagina: 1, limite: 20 } }).then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapReview)
    }),
    enabled: !!institutionId,
  })
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['myReviews'],
    queryFn: () => api.get('/resenas/mias').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapReview)
    }),
  })
}

export function useSubmitReview(institutionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post(`/resenas/institucion/${institutionId}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', institutionId] }),
  })
}

export function useUpdateReview(reviewId, institutionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put(`/resenas/${reviewId}`, data).then(r => r.data),
    onSuccess: () => {
      if (institutionId) qc.invalidateQueries({ queryKey: ['reviews', institutionId] })
      qc.invalidateQueries({ queryKey: ['myReviews'] })
    },
  })
}

export function useDeleteReview(reviewId, institutionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/resenas/${reviewId}`).then(r => r.data),
    onSuccess: () => {
      if (institutionId) qc.invalidateQueries({ queryKey: ['reviews', institutionId] })
      qc.invalidateQueries({ queryKey: ['myReviews'] })
    },
  })
}
