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
    mutationFn: () => api.post('/ia/resumen', {}).then(r => r.data),
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
