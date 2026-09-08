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
      return raw.map((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>
          return String(obj.institucion_id ?? obj.institution_id ?? obj.id ?? '')
        }
        return String(item)
      })
    }),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (target: unknown) => {
      const targetObj = target as Record<string, unknown> | string | number
      const id = typeof targetObj === 'object' && targetObj !== null
        ? (targetObj.id ?? targetObj.institutionId ?? String(targetObj))
        : String(targetObj)
      return api.post(`/favoritos/${id}/alternar`).then(r => r.data)
    },
    onMutate: async (target: unknown) => {
      const id = String(
        typeof target === 'object' && target !== null
          ? ((target as Record<string, unknown>).id ?? (target as Record<string, unknown>).institutionId)
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
            : (Array.isArray((previousFavoriteIds as { datos?: unknown[] } | undefined)?.datos) ? (previousFavoriteIds as { datos: unknown[] }).datos.map(String) : []))

      const isFav = rawIds.includes(id) ||
        (Array.isArray(previousFavorites) && previousFavorites.some((f: Record<string, unknown>) => String(f.id) === id))

      // 3. Optimistically update ['favoriteIds']
      if (isFav) {
        qc.setQueryData(['favoriteIds'], rawIds.filter((favId: string) => favId !== id))
      } else {
        qc.setQueryData(['favoriteIds'], [...rawIds, id])
      }

      // 4. Optimistically update ['favorites']
      if (Array.isArray(previousFavorites)) {
        if (isFav) {
          // Immediately remove the institution from the favorites list!
          qc.setQueryData(['favorites'], previousFavorites.filter((inst: Record<string, unknown>) => String(inst.id) !== id))
        } else if (typeof target === 'object' && target !== null && ((target as Record<string, unknown>).name || (target as Record<string, unknown>).nombre)) {
          // Immediately add the institution to the favorites list!
          qc.setQueryData(['favorites'], [mapInstitucion(target as Parameters<typeof mapInstitucion>[0]), ...previousFavorites])
        }
      }

      return { previousFavorites, previousFavoriteIds }
    },
    onSuccess: (data: unknown) => {
      // Server confirmed — apply the final state so the UI stays consistent
      let serverIds: string[] | null = null
      if (Array.isArray(data)) {
        serverIds = data.map((item: unknown) => {
          if (typeof item !== 'object' || item === null) return String(item)
          const obj = item as Record<string, unknown>
          return String((obj.institucion_id as string | undefined) ?? (obj.institution_id as string | undefined) ?? (obj.id as string | undefined) ?? String(obj))
        })
      } else if (typeof data === 'object' && data !== null && 'datos' in data) {
        const datos = (data as { datos: unknown[] }).datos
        if (Array.isArray(datos)) {
          serverIds = datos.map((item: unknown) => {
            if (typeof item !== 'object' || item === null) return String(item)
            const obj = item as Record<string, unknown>
            return String((obj.institucion_id as string | undefined) ?? (obj.institution_id as string | undefined) ?? (obj.id as string | undefined) ?? String(obj))
          })
        }
      }
      if (serverIds) {
        qc.setQueryData(['favoriteIds'], serverIds)
        // Also update the full favorites list
        qc.setQueryData(['favorites'], (old: unknown) => {
          if (!Array.isArray(old)) return old
          const serverIdSet = new Set(serverIds)
          return old.filter((inst: Record<string, unknown>) => serverIdSet.has(String(inst.id)))
        })
      } else {
        // Fallback: just invalidate to get accurate data
        qc.invalidateQueries({ queryKey: ['favorites'] })
        qc.invalidateQueries({ queryKey: ['favoriteIds'] })
      }
    },
    onError: (_err: unknown, _target: unknown, context: { previousFavorites?: unknown; previousFavoriteIds?: unknown } | undefined) => {
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
