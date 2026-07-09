import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export function useReviews(institutionId) {
  return useQuery({
    queryKey: ['reviews', institutionId],
    queryFn: () => api.get(`/reviews/institution/${institutionId}`).then(r => r.data),
    enabled: !!institutionId,
  })
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['myReviews'],
    queryFn: () => api.get('/reviews/mine').then(r => r.data),
  })
}

export function useSubmitReview(institutionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post(`/reviews/institution/${institutionId}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', institutionId] }),
  })
}
