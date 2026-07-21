import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../shared/lib/api'

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/favorites').then(r => r.data),
  })
}

export function useFavoriteIds() {
  return useQuery({
    queryKey: ['favoriteIds'],
    queryFn: () => api.get('/favorites/ids').then(r => r.data),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/favorites/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] })
      qc.invalidateQueries({ queryKey: ['favoriteIds'] })
    },
  })
}
