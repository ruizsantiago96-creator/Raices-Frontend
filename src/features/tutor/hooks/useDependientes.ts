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
import type {
  Dependiente,
  RawBackendDependiente,
  CrearDependientePayload,
  UpdateDependentPayload,
  DependentFeatures,
  MisPersonasParams,
  MisPersonasResponse,
  DependientesCountResponse,
} from '@/types/tutor'

/**
 * Mapea un dependiente del backend al formato que el frontend espera.
 *
 * Backend devuelve: { id, tutorId, nombreCompleto, parentesco, etapaVida, necesidades[], rol, fechaCreacion }
 * Frontend espera:  { id, nombreCompleto, parentesco, etapaVida, tiposDiscapacidad[], notas }
 */
function mapDependiente(dep: RawBackendDependiente): Dependiente {
  if (!dep) return dep as unknown as Dependiente
  return {
    ...(dep as Record<string, unknown>),
    id: dep.id ?? dep._id ?? '',
    nombreCompleto: dep.nombreCompleto ?? dep.nombre ?? '',
    parentesco: dep.parentesco ?? '',
    tiposDiscapacidad: dep.necesidades ?? dep.tiposDiscapacidad ?? [],
  } as Dependiente
}

/**
 * Hook: consulta los dependientes del usuario autenticado.
 *
 * - Cache key: ['dependientes']
 * - staleTime: 5 minutos (evita llamadas innecesarias)
 * - retry: 1 (un reintento en caso de fallo de red esporádico)
 * - Solo se ejecuta si existe token de autenticación
 */
export function useDependientes() {
  const { token } = useAuthStore()

  const { data, isLoading, isError, error, refetch } = useQuery<Dependiente[]>({
    queryKey: ['dependientes'],
    queryFn: async () => {
      const raw = await getDependientes()
      const arr: RawBackendDependiente[] = Array.isArray(raw)
        ? raw
        : ((raw as { datos?: RawBackendDependiente[] })?.datos ?? [])
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
    refetch,
  }
}

/**
 * Hook: consulta la lista consolidada "Mis Personas" (dependientes + cuentas PCD vinculadas).
 *
 * - Cache key: ['mis-personas']
 * - Soporta paginación, búsqueda y ordenamiento
 */
export function useMisPersonas(params: MisPersonasParams = {}) {
  const { token } = useAuthStore()

  return useQuery<MisPersonasResponse>({
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

  return useQuery<DependientesCountResponse>({
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
 */
export function useAddDependiente() {
  const qc = useQueryClient()
  return useMutation<Dependiente, Error, CrearDependientePayload>({
    mutationFn: async (payload) => (await createDependiente(payload)) as Dependiente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
      qc.invalidateQueries({ queryKey: ['dependientes-count'] })
    },
  })
}

export function useDependiente(id: string | number) {
  const { token } = useAuthStore()
  return useQuery<Dependiente>({
    queryKey: ['dependiente', id],
    queryFn: () => api.get(`/usuarios/dependientes/${id}`).then(r => r.data),
    enabled: !!token && !!id,
  })
}

export function useUpdateDependent() {
  const qc = useQueryClient()
  return useMutation<Dependiente, Error, UpdateDependentPayload>({
    mutationFn: ({ id, ...data }) => api.put(`/usuarios/dependientes/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
    },
  })
}

export function useDeleteDependent() {
  const qc = useQueryClient()
  return useMutation<{ exito?: boolean }, Error, string | number>({
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
  return useMutation<unknown, Error, string>({
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
  return useMutation<{ desvinculado: boolean; pcdUserId: string; tutorId: string }, Error, string | number>({
    mutationFn: (pcdUserId) => unlinkPCD(String(pcdUserId)),
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
  return useMutation<{ id: string | number; features: DependentFeatures }, Error, { id: string | number; features: DependentFeatures }>({
    mutationFn: async ({ id, features }) =>
      (await updateDependentFeaturesPatch(String(id), features)) as { id: string | number; features: DependentFeatures },
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
  return useMutation<{ id: string | number; features: DependentFeatures }, Error, { pcdId: string | number; features: DependentFeatures }>({
    mutationFn: async ({ pcdId, features }) =>
      (await updatePCDLinkedFeaturesPatch(String(pcdId), features)) as { id: string | number; features: DependentFeatures },
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
  return useMutation<unknown, Error, { id: string | number; features: DependentFeatures }>({
    mutationFn: ({ id, features }) => api.put(`/usuarios/dependientes/${id}/features`, features).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
    },
  })
}
