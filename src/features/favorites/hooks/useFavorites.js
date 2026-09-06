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
      const raw = Array.isArray(res) ? res : (res?.datos ?? [])
      return raw.map(item => {
        if (typeof item === 'object' && item !== null) {
          return String(item.institucion_id ?? item.institution_id ?? item.id)
        }
        return String(item)
      })
    }),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (target) => {
      const id = typeof target === 'object' && target !== null
        ? (target.id ?? target.institutionId)
        : target
      return api.post(`/favoritos/${id}/alternar`).then(r => r.data)
    },
    onMutate: async (target) => {
      const id = String(
        typeof target === 'object' && target !== null
          ? (target.id ?? target.institutionId)
          : target
      )

      // 1. Cancel ongoing queries to prevent race conditions
      await qc.cancelQueries({ queryKey: ['favorites'] })
      await qc.cancelQueries({ queryKey: ['favoriteIds'] })

      // 2. Snapshot current caches for rollback
      const previousFavorites = qc.getQueryData(['favorites'])
      const previousFavoriteIds = qc.getQueryData(['favoriteIds'])

      // Normalize current ID list to string array
      const rawIds = Array.isArray(previousFavoriteIds)
        ? previousFavoriteIds.map(String)
        : (previousFavoriteIds instanceof Set
            ? Array.from(previousFavoriteIds).map(String)
            : (Array.isArray(previousFavoriteIds?.datos) ? previousFavoriteIds.datos.map(String) : []))

      const isFav = rawIds.includes(id) ||
        (Array.isArray(previousFavorites) && previousFavorites.some(f => String(f.id) === id))

      // 3. Optimistically update ['favoriteIds']
      if (isFav) {
        qc.setQueryData(['favoriteIds'], rawIds.filter(favId => favId !== id))
      } else {
        qc.setQueryData(['favoriteIds'], [...rawIds, id])
      }

      // 4. Optimistically update ['favorites']
      if (Array.isArray(previousFavorites)) {
        if (isFav) {
          // Immediately remove the institution from the favorites list!
          qc.setQueryData(['favorites'], previousFavorites.filter(inst => String(inst.id) !== id))
        } else if (typeof target === 'object' && target !== null && (target.name || target.nombre)) {
          // Immediately add the institution to the favorites list!
          qc.setQueryData(['favorites'], [mapInstitucion(target), ...previousFavorites])
        }
      }

      return { previousFavorites, previousFavoriteIds }
    },
    onSuccess: (data, target, context) => {
      // Server confirmed — apply the final state so the UI stays consistent
      const id = String(
        typeof target === 'object' && target !== null
          ? (target.id ?? target.institutionId)
          : target
      )
      const serverIds = Array.isArray(data)
        ? data.map(item => String(item.institucion_id ?? item.institution_id ?? item.id ?? item))
        : (Array.isArray(data?.datos)
            ? data.datos.map(item => String(item.institucion_id ?? item.institution_id ?? item.id ?? item))
            : null)
      if (serverIds) {
        qc.setQueryData(['favoriteIds'], serverIds)
        // Also update the full favorites list
        qc.setQueryData(['favorites'], (old) => {
          if (!Array.isArray(old)) return old
          const serverIdSet = new Set(serverIds)
          return old.filter(inst => serverIdSet.has(String(inst.id)))
        })
      } else {
        // Fallback: just invalidate to get accurate data
        qc.invalidateQueries({ queryKey: ['favorites'] })
        qc.invalidateQueries({ queryKey: ['favoriteIds'] })
      }
    },
    onError: (err, target, context) => {
      // Roll back optimistic update on error
      if (context?.previousFavorites) {
        qc.setQueryData(['favorites'], context.previousFavorites)
      }
      if (context?.previousFavoriteIds) {
        qc.setQueryData(['favoriteIds'], context.previousFavoriteIds)
      }
    },
  })
}
