import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type { Review, RawBackendReview } from '@/types/institutions'

/**
 * Normaliza los campos de reseña del backend (español) a los campos
 * en inglés que los componentes esperan.
 */
function mapReview(r: RawBackendReview): Review {
  const authorName = r.nombreUsuario ?? r.usuarioNombre ?? r.full_name ?? r.user_name ?? r.reviewer_name ?? r.usuario?.nombreCompleto ?? 'Anónimo'
  return {
    ...r,
    id: r.id ?? '',
    rating: r.calificacion ?? r.rating ?? 0,
    comment: r.comentario ?? r.comment ?? '',
    full_name: authorName,
    user_name: authorName,
    reviewer_name: authorName,
    user_id: r.usuarioId ?? r.usuario_id ?? r.user_id,
    institution_name: r.nombreInstitucion ?? r.institucionNombre ?? r.institution_name ?? r.institucion?.nombre,
    created_at: r.fechaCreacion ?? r.created_at ?? r.fecha_creacion,
  }
}

export function useReviews(institutionId?: string | number): UseQueryResult<Review[]> {
  return useQuery({
    queryKey: ['reviews', institutionId],
    queryFn: async (): Promise<Review[]> => {
      const r = await api.get(`/resenas/institucion/${institutionId}`, { params: { pagina: 1, limite: 20 } })
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return (data as RawBackendReview[]).map(mapReview)
    },
    enabled: !!institutionId,
  })
}

export function useMyReviews(): UseQueryResult<Review[]> {
  return useQuery({
    queryKey: ['myReviews'],
    queryFn: async (): Promise<Review[]> => {
      const r = await api.get('/resenas/mias')
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return (data as RawBackendReview[]).map(mapReview)
    },
  })
}

export interface SubmitReviewPayload {
  calificacion: number
  comentario: string
  [key: string]: unknown
}

export function useSubmitReview(institutionId?: string | number): UseMutationResult<unknown, Error, SubmitReviewPayload> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SubmitReviewPayload) => api.post(`/resenas/institucion/${institutionId}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', institutionId] }),
  })
}

export function useUpdateReview(reviewId?: string | number, institutionId?: string | number): UseMutationResult<unknown, Error, SubmitReviewPayload> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SubmitReviewPayload) => api.put(`/resenas/${reviewId}`, data).then(r => r.data),
    onSuccess: () => {
      if (institutionId) qc.invalidateQueries({ queryKey: ['reviews', institutionId] })
      qc.invalidateQueries({ queryKey: ['myReviews'] })
    },
  })
}

export function useDeleteReview(reviewId?: string | number, institutionId?: string | number): UseMutationResult<unknown, Error, void> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/resenas/${reviewId}`).then(r => r.data),
    onSuccess: () => {
      if (institutionId) qc.invalidateQueries({ queryKey: ['reviews', institutionId] })
      qc.invalidateQueries({ queryKey: ['myReviews'] })
    },
  })
}
