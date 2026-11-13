import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import { useCallback } from 'react'
import type {
  AIChatPayload,
  AIChatResponse,
  AINextStepsResponse,
  AIResumenResponse,
} from '@/types/tutor'
import type { AxiosError } from 'axios'

const STORAGE_KEY = 'ai_last_fetch_ts'
const DEBOUNCE_MS = 5 * 60 * 1000 // 5 min entre requests (respeta rate limit del backend)

/**
 * Hook para el chat de IA.
 * POST /api/ia/conversacion
 */
export function useChat() {
  return useMutation<AIChatResponse, AxiosError, AIChatPayload>({
    mutationFn: (data) => api.post('/ia/conversacion', data).then(r => r.data),
    onError: (error) => {
      if (error.response?.status === 429) {
        console.warn('[AI Chat] Rate limit alcanzado (429). Espera antes de intentar de nuevo.')
      }
    },
  })
}

/**
 * AI Recommendations — MANUAL trigger only (prevents 429 spam).
 *
 * POST /api/ia/recomendaciones
 *
 * Response shape:
 *   { proximosPasos: string[], razonamiento: string, sugerenciasInstitucion?: [], simulado: boolean }
 *
 * Debounce persistido en localStorage (sobrevive remounts y refresh).
 * NO se auto-dispara en mount.
 */
export function useAINextSteps() {
  const { token } = useAuthStore()
  const qc = useQueryClient()

  // Read cached data if available (from queryClient cache)
  const cached = qc.getQueryData<AINextStepsResponse>(['ai', 'next-steps'])

  const mutation = useMutation<AINextStepsResponse, AxiosError>({
    mutationFn: () => api.post('/ia/recomendaciones', {}).then(r => r.data),
    onSuccess: (data) => {
      qc.setQueryData(['ai', 'next-steps'], data)
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        localStorage.removeItem(STORAGE_KEY)
        console.warn('[AI Recs] Rate limit alcanzado (429).')
      }
    },
  })

  const canFetch = useCallback(() => {
    if (!token) return false
    const lastTs = Number(localStorage.getItem(STORAGE_KEY) ?? 0)
    return Date.now() - lastTs >= DEBOUNCE_MS
  }, [token])

  const fetch = useCallback(() => {
    if (!token) return
    const lastTs = Number(localStorage.getItem(STORAGE_KEY) ?? 0)
    if (Date.now() - lastTs < DEBOUNCE_MS) return // debounce — still within cooldown
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    mutation.mutate()
  }, [token, mutation])

  return {
    data: cached ?? mutation.data ?? null,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isRateLimited: mutation.error?.response?.status === 429,
    canFetch,
    fetch,
    refetch: fetch,
  }
}

/**
 * Recomendaciones IA personalizadas para un familiar específico (on-demand).
 *
 * POST /api/ia/recomendaciones
 * Body: { dependienteId: string }
 */
export function useAIForDependent() {
  return useMutation<AINextStepsResponse, AxiosError, string | number>({
    mutationFn: (dependentId) =>
      api.post('/ia/recomendaciones', { dependienteId: dependentId }).then(r => r.data),
    onError: (error) => {
      if (error.response?.status === 429) {
        console.warn('[AI Dependent] Rate limit alcanzado (429).')
      }
    },
  })
}

/**
 * Resumen narrativo IA del perfil del usuario.
 *
 * POST /api/ia/resumen
 */
const RESUMEN_STORAGE_KEY = 'ai_resumen_last_fetch_ts'
const RESUMEN_DEBOUNCE_MS = 5 * 60 * 1000 // 5 min entre requests

export function useAIResumen() {
  const { token } = useAuthStore()
  const qc = useQueryClient()
  const cached = qc.getQueryData<AIResumenResponse>(['ai', 'resumen'])

  const mutation = useMutation<AIResumenResponse, AxiosError>({
    mutationFn: async () => {
      const user = useAuthStore.getState().user
      const depName = localStorage.getItem('raices_dep_name')?.trim() || ''
      const dest = localStorage.getItem('raices_destinatario')?.trim() || 'hijo'
      const isPcd = user?.role === 'pcd' || user?.rol === 'pcd'
      const isTutor = !isPcd && (user?.role === 'tutor' || user?.role === 'padre_tutor' || user?.rol === 'padre_tutor' || Boolean(depName))

      // Sincronizar escalas locales (incluyendo tieneDiagnostico) con el backend si están guardadas localmente
      try {
        const rawScales = localStorage.getItem('raices_user_scales')
        if (rawScales) {
          const parsed = JSON.parse(rawScales) as Record<string, unknown>
          if (parsed && typeof parsed === 'object' && typeof parsed.tieneDiagnostico === 'boolean') {
            const clamp = (v: unknown): number => Math.min(4, Math.max(1, Number(v) || 3))
            const rawMov = Number(parsed.nivelMovilidad ?? parsed.movilidad ?? 3)
            const normMov = rawMov >= 7 ? 4 : (rawMov === 6 || rawMov === 4) ? 3 : (rawMov === 5 || rawMov === 3) ? 2 : 1
            await api.post('/usuarios/escalas-vida', {
              nivelAutonomia: clamp(parsed.nivelAutonomia ?? parsed.autonomia),
              nivelIndependencia: clamp(parsed.nivelIndependencia ?? parsed.independencia),
              nivelComunicacion: clamp(parsed.nivelComunicacion ?? parsed.comunicacion),
              nivelComprension: clamp(parsed.nivelComprension ?? parsed.comprension),
              nivelEnergia: clamp(parsed.nivelEnergia ?? parsed.energia),
              nivelMovilidad: normMov,
              nivelSocial: clamp(parsed.nivelSocial ?? parsed.social),
              nivelEmocional: clamp(parsed.nivelEmocional ?? parsed.emocional),
              tieneDiagnostico: Boolean(parsed.tieneDiagnostico),
              ...(typeof parsed.temporalidadOrigen === 'string' && parsed.temporalidadOrigen ? { temporalidadOrigen: parsed.temporalidadOrigen } : {}),
              ...(typeof parsed.preferenciaFormato === 'string' && parsed.preferenciaFormato ? { preferenciaFormato: parsed.preferenciaFormato } : {}),
              ...(Array.isArray(parsed.areasInteres) ? { areasInteres: parsed.areasInteres } : {}),
              ...(typeof parsed.viabilidadEconomica === 'string' && parsed.viabilidadEconomica ? { viabilidadEconomica: parsed.viabilidadEconomica } : {}),
            }).catch(() => {})
          }
        }
      } catch {}

      const body: Record<string, unknown> = {}
      if (isTutor) {
        body.rol = 'tutor'
        if (user?.full_name) body.nombreTutor = user.full_name
        if (depName) {
          body.nombreDependiente = depName
          body.parentesco = dest
        }
      }
      return api.post('/ia/resumen', body).then(r => r.data)
    },
    onSuccess: (data) => {
      qc.setQueryData(['ai', 'resumen'], data)
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        localStorage.removeItem(RESUMEN_STORAGE_KEY)
        console.warn('[AI Resumen] Rate limit alcanzado (429).')
      }
    },
  })

  const canFetch = useCallback(() => {
    if (!token) return false
    const lastTs = Number(localStorage.getItem(RESUMEN_STORAGE_KEY) ?? 0)
    return Date.now() - lastTs >= RESUMEN_DEBOUNCE_MS
  }, [token])

  const fetch = useCallback(() => {
    if (!token) return
    const lastTs = Number(localStorage.getItem(RESUMEN_STORAGE_KEY) ?? 0)
    if (Date.now() - lastTs < RESUMEN_DEBOUNCE_MS) return
    localStorage.setItem(RESUMEN_STORAGE_KEY, String(Date.now()))
    mutation.mutate()
  }, [token, mutation])

  return {
    data: cached ?? mutation.data ?? null,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isRateLimited: mutation.error?.response?.status === 429,
    canFetch,
    fetch,
  }
}
