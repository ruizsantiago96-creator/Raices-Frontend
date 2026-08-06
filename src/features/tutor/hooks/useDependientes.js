import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import {
  getDependientes,
  createDependiente,
  getDependientesCount,
  getMisPersonas,
  updateDependentFeaturesPatch,
  updatePCDLinkedFeaturesPatch,
  unlinkPCD,
} from '../fetchers/dependientes'

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
    // El backend puede devolver "necesidades" o "tiposDiscapacidad"
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
 * Hook: consulta la lista consolidada "Mis Personas" (dependientes + cuentas PCD vinculadas).
 *
 * - Cache key: ['mis-personas']
 * - Soporta paginación, búsqueda y ordenamiento
 *
 * @param {Object} params
 * @param {number} [params.pagina=1]
 * @param {number} [params.limite=20]
 * @param {string} [params.buscar]
 * @returns {{ data, isLoading, isError, error }}
 */
export function useMisPersonas(params = {}) {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['mis-personas', params],
    queryFn: () => getMisPersonas(params),
    enabled: !!token,
    staleTime: 3 * 60 * 1000, // 3 minutos
    retry: 1,
  })
}

/**
 * Hook: obtiene el conteo de dependientes y límite restante.
 *
 * - Cache key: ['dependientes-count']
 * - GET /api/usuarios/dependientes/count
 * - Retorna { total, limite, restantes }
 */
export function useDependientesCount() {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['dependientes-count'],
    queryFn: getDependientesCount,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
      qc.invalidateQueries({ queryKey: ['dependientes-count'] })
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
    },
  })
}

export function useDeleteDependent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/usuarios/dependientes/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
      qc.invalidateQueries({ queryKey: ['dependientes-count'] })
    },
  })
}

/**
 * Mutación: vincula una cuenta PCD al tutor actual por correo electrónico.
 * POST /usuarios/vincular-pcd  { email }
 *
 * El backend busca internamente al usuario por email, valida que tenga
 * el rol PCD y realiza la vinculación en un solo paso.
 */
export function useVincularPCD() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email) => api.post('/usuarios/vincular-pcd', { email }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
      qc.invalidateQueries({ queryKey: ['dependientes-count'] })
    },
  })
}

/**
 * Mutación: desvincula una cuenta PCD del tutor.
 * DELETE /api/usuarios/pcd-vinculado/:pcdUserId/desvincular
 */
export function useUnlinkPCD() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: unlinkPCD,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
      qc.invalidateQueries({ queryKey: ['dependientes-count'] })
    },
  })
}

/**
 * Mutación: actualiza las features de un dependiente con PATCH (reemplaza PUT deprecado).
 * PATCH /usuarios/dependientes/:dependienteId/features
 */
export function useUpdateDependentFeaturesPatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, features }) => updateDependentFeaturesPatch(id, features),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
    },
  })
}

/**
 * Mutación: actualiza las features de una cuenta PCD vinculada con PATCH.
 * PATCH /usuarios/vincular-pcd/:pcdId/features
 */
export function useUpdatePCDLinkedFeaturesPatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pcdId, features }) => updatePCDLinkedFeaturesPatch(pcdId, features),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
    },
  })
}

/**
 * Mutación: actualiza las features configuradas para un dependiente (PUT deprecado).
 * PUT /usuarios/dependientes/:id/features
 * @deprecated Usa useUpdateDependentFeaturesPatch en su lugar
 */
export function useUpdateDependentFeatures() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, features }) => api.put(`/usuarios/dependientes/${id}/features`, features).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
    },
  })
}
