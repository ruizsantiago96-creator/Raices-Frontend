import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export function useJobs(filters = {}) {
  const params = new URLSearchParams()
  if (filters.city) params.set('city', filters.city)
  if (filters.modality) params.set('modality', filters.modality)
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.get(`/jobs?${params}`).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useAppliedJobIds() {
  return useQuery({
    queryKey: ['jobs', 'applied'],
    queryFn: () => api.get('/jobs/applied').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useMyApplications() {
  return useQuery({
    queryKey: ['jobs', 'my-applications'],
    queryFn: () => api.get('/jobs/my-applications').then(r => r.data),
  })
}

export function useApplyJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, cover_letter }) =>
      api.post(`/jobs/${jobId}/apply`, { cover_letter }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs', 'applied'] })
      qc.invalidateQueries({ queryKey: ['jobs', 'my-applications'] })
    },
  })
}
