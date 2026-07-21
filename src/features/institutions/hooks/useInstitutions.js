import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../../../shared/lib/api'

export function useInstitutions(filters = {}) {
  return useQuery({
    queryKey: ['institutions', filters],
    queryFn: () => api.get('/institutions', { params: filters }).then(r => r.data),
  })
}

export function useInstitution(id) {
  return useQuery({
    queryKey: ['institution', id],
    queryFn: () => api.get(`/institutions/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useDiscovery() {
  return useQuery({
    queryKey: ['discovery'],
    queryFn: () => api.get('/discovery').then(r => r.data),
  })
}
