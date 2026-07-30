import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import { getDependientes, createDependiente } from '../fetchers/dependientes'

/**
 * Mapea un dependiente del backend al formato que el frontend espera.
 *
 * Backend devuelve: { id, tutorId, nombreCompleto, parentesco, etapaVida, necesidades[], rol, fechaCreacion }
 * Frontend espera:  { id, nombreCompleto, parentesco, etapaVida, tiposDiscapacidad[], notas }
 */
function mapDependiente(dep) {
  if (!dep) return dep
  return {
    ...dep,
    // El backend devuelve "necesidades", el frontend lee "tiposDiscapacidad"
    tiposDiscapacidad: dep.necesidades ?? dep.tiposDiscapacidad ?? [],
  }
}

/**
 * Hook: consulta los dependientes del usuario autenticado.
 *
 * - Cache key: ['dependientes']
 * - staleTime: 5 minutos (evita llamadas innecesarias)
 * - retry: 1 (un reintento en caso de fallo de red esporádico)
 * - Solo se ejecuta si existe token de autenticación
 *
 * @returns {{ data: Array, isLoading: boolean, isError: boolean, error: Error|null }}
 */
export function useDependientes() {
  const { token } = useAuthStore()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dependientes'],
    queryFn: async () => {
      const raw = await getDependientes()
      const arr = Array.isArray(raw) ? raw : (raw?.datos ?? [])
      return arr.map(mapDependiente)
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  })

  return {
    data: data ?? [],
    isLoading,
    isError,
    error,
  }
}

/**
 * Mutación: crea un nuevo dependiente.
 *
 * Al tener éxito, invalida la caché de ['dependientes'] para que la
 * lista se recargue automáticamente.
 *
 * @returns {UseMutationResult} { mutate, mutateAsync, isPending, isError, error, data, reset }
 */
export function useAddDependiente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createDependiente,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependientes'] }),
  })
}

export function useDependiente(id) {
  const { token } = useAuthStore()
  return useQuery({
    queryKey: ['dependiente', id],
    queryFn: () => api.get(`/usuarios/dependientes/${id}`).then(r => r.data),
    enabled: !!token && !!id,
  })
}

export function useUpdateDependent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/usuarios/dependientes/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependientes'] }),
  })
}

export function useDeleteDependent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/usuarios/dependientes/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependientes'] }),
  })
}

/**
 * Mutación: vincula una cuenta PCD al tutor actual.
 * POST /usuarios/vincular-pcd/:pcdUserId
 */
export function useVincularPCD() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pcdUserId) => api.post(`/usuarios/vincular-pcd/${pcdUserId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependientes'] }),
  })
}

/**
 * Mutación: actualiza las features configuradas para un dependiente.
 * PUT /usuarios/dependientes/:id/features
 */
export function useUpdateDependentFeatures() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, features }) => api.put(`/usuarios/dependientes/${id}/features`, features).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dependientes'] }),
  })
}


