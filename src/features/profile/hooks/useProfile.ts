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
    queryFn: async () => {
      const res = await api.get('/usuarios/perfil')
      const data = res.data
      if (data && typeof data === 'object') {
        const rawScales = ((data as Record<string, unknown>).escalasVida ||
          ((data as Record<string, unknown>).perfilesExtendidos as Record<string, unknown> | undefined)?.escalasVida) as Record<string, unknown> | undefined

        if (rawScales && typeof rawScales === 'object') {
          // Normalizar llaves para soportar tanto formato backend (autonomia) como frontend (nivelAutonomia)
          const normalizedScales = {
            ...rawScales,
            nivelAutonomia: rawScales.nivelAutonomia ?? rawScales.autonomia,
            nivelIndependencia: rawScales.nivelIndependencia ?? rawScales.independencia,
            nivelComunicacion: rawScales.nivelComunicacion ?? rawScales.comunicacion,
            nivelComprension: rawScales.nivelComprension ?? rawScales.comprension,
            nivelEnergia: rawScales.nivelEnergia ?? rawScales.energia,
            nivelMovilidad: rawScales.nivelMovilidad ?? rawScales.movilidad,
            nivelSocial: rawScales.nivelSocial ?? rawScales.social,
            nivelEmocional: rawScales.nivelEmocional ?? rawScales.emocional,
            autonomia: rawScales.autonomia ?? rawScales.nivelAutonomia,
            independencia: rawScales.independencia ?? rawScales.nivelIndependencia,
            comunicacion: rawScales.comunicacion ?? rawScales.nivelComunicacion,
            comprension: rawScales.comprension ?? rawScales.nivelComprension,
            energia: rawScales.energia ?? rawScales.nivelEnergia,
            movilidad: rawScales.movilidad ?? rawScales.nivelMovilidad,
            social: rawScales.social ?? rawScales.nivelSocial,
            emocional: rawScales.emocional ?? rawScales.nivelEmocional,
          }
          ;(data as Record<string, unknown>).escalasVida = normalizedScales
          try {
            localStorage.setItem('raices_user_scales', JSON.stringify(normalizedScales))
          } catch {
            // omitir
          }
        }
      }
      return data
    },
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
    mutationFn: (payload: EscalasVidaPayload) => {
      const validTemporalidades = ['nacimiento', 'infancia', 'adolescencia', 'vida_adulta', 'progresiva', 'en_evaluacion']
      const validFormatos = ['texto', 'imagenes', 'audio', 'video', 'presencial']

      let temporalidad = String(payload.temporalidadOrigen || '').trim()
      if (!validTemporalidades.includes(temporalidad)) {
        temporalidad = 'nacimiento'
      }

      let formato = String(payload.preferenciaFormato || '').trim()
      if (formato === 'persona') {
        formato = 'presencial'
      }
      if (!validFormatos.includes(formato)) {
        formato = 'texto'
      }

      const cleanPayload = {
        ...payload,
        temporalidadOrigen: temporalidad,
        preferenciaFormato: formato,
      }

      return api.post('/usuarios/escalas-vida', cleanPayload).then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
