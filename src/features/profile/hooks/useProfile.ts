import { useEffect } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth/store/authStore'
import { useUiStore } from '@shared/stores/uiStore'
import {
  UserProfile,
  UpdateProfilePayload,
  EscalasVidaPayload,
} from '@/types/profile'

interface ApiErrorResponse {
  message?: string
  [key: string]: unknown
}

interface CustomError extends Error {
  response?: {
    data?: ApiErrorResponse
    status?: number
  }
}

/**
 * Hook para consultar el perfil del usuario autenticado.
 * GET /usuarios/perfil
 */
export function useProfile(): UseQueryResult<UserProfile, CustomError> {
  const { token } = useAuthStore()
  const addToast = useUiStore((s) => s.addToast)

  const query = useQuery<UserProfile, CustomError>({
    queryKey: ['perfil'],
    queryFn: () => api.get('/usuarios/perfil').then((r) => r.data),
    enabled: !!token,
  })

  // Error handling con useEffect (v5 ya no soporta onError en useQuery)
  useEffect(() => {
    if (query.isError) {
      const message =
        query.error?.response?.data?.message ||
        query.error?.message ||
        'No se pudo cargar la información del perfil'
      addToast(message, 'error')
    }
  }, [query.isError, query.error, addToast])

  return query
}

export default useProfile

/**
 * Hook para actualizar los datos de perfil del usuario.
 * PUT /usuarios/perfil
 */
export function useUpdateProfile(): UseMutationResult<
  UserProfile,
  CustomError,
  UpdateProfilePayload
> {
  const qc = useQueryClient()
  return useMutation<UserProfile, CustomError, UpdateProfilePayload>({
    mutationFn: (data: UpdateProfilePayload) =>
      api.put('/usuarios/perfil', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['yo'] })
    },
  })
}

/**
 * Guarda las escalas de vida del usuario.
 * POST /api/usuarios/escalas-vida
 */
export function useSaveEscalasVida(): UseMutationResult<
  unknown,
  CustomError,
  EscalasVidaPayload
> {
  const qc = useQueryClient()
  return useMutation<unknown, CustomError, EscalasVidaPayload>({
    mutationFn: (payload: EscalasVidaPayload) =>
      api.post('/usuarios/escalas-vida', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
