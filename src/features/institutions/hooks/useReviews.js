import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

export function useReviews(institutionId) {
  return useQuery({
    queryKey: ['reviews', institutionId],
    queryFn: () => api.get(`/resenas/institucion/${institutionId}`, { params: { pagina: 1, limite: 20 } }).then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
    }),
    enabled: !!institutionId,
  })
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['myReviews'],
    queryFn: () => api.get('/resenas/mias').then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
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
