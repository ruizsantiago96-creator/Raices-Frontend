import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/profile').then(r => r.data),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/users/profile', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useSaveProfiling() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/users/profiling', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}
