import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { mapInstitucion } from '@features/institutions/hooks/useInstitutions'

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/favoritos').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapInstitucion)
    }),
  })
}

export function useFavoriteIds() {
  return useQuery({
    queryKey: ['favoriteIds'],
    queryFn: () => api.get('/favoritos/ids').then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
    }),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (institutionId) => api.post(`/favoritos/${institutionId}/alternar`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] })
      qc.invalidateQueries({ queryKey: ['favoriteIds'] })
    },
  })
}
