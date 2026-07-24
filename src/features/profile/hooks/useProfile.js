import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

export function useProfile() {
  return useQuery({
    queryKey: ['perfil'],
    queryFn: () => api.get('/usuarios/perfil').then(r => r.data),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/usuarios/perfil', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['yo'] })
    },
  })
}

export function useSaveProfiling() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/usuarios/perfil-necesidades', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perfil'] }),
  })
}
