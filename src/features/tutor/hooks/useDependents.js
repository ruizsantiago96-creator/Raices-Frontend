import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

export function useDependents() {
  const { token } = useAuthStore()
  return useQuery({
    queryKey: ['dependents'],
    queryFn: () => api.get('/users/dependents').then(r => r.data),
    enabled: !!token,
  })
}

export function useAddDependent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/users/dependents', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependents'] }),
  })
}

export function useUpdateDependent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/users/dependents/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependents'] }),
  })
}

export function useDeleteDependent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/users/dependents/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependents'] }),
  })
}
