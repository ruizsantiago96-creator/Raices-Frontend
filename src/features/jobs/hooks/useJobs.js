import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

export function useJobs(filters = {}) {
  const params = new URLSearchParams()
  if (filters.buscar) params.set('buscar', filters.buscar)
  if (filters.ciudad) params.set('ciudad', filters.ciudad)
  if (filters.modalidad) params.set('modalidad', filters.modalidad)
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.get(`/empleo?${params}`).then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
    }),
    staleTime: 1000 * 60 * 2,
  })
}

export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/empleo/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useAppliedJobIds() {
  return useQuery({
    queryKey: ['jobs', 'applied'],
    queryFn: () => api.get('/empleo/postuladas').then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
    }),
    staleTime: 1000 * 60 * 5,
  })
}

export function useMyApplications() {
  return useQuery({
    queryKey: ['jobs', 'my-applications'],
    queryFn: () => api.get('/empleo/mis-postulaciones').then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
    }),
  })
}

export function useApplyJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, cover_letter }) =>
      api.post(`/empleo/${jobId}/postularse`, { cartaPresentacion: cover_letter }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs', 'applied'] })
      qc.invalidateQueries({ queryKey: ['jobs', 'my-applications'] })
    },
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/empleo', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/empleo/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/empleo/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
