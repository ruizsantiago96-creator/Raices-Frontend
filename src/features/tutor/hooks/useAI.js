import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import { useCallback } from 'react'

const STORAGE_KEY = 'ai_last_fetch_ts'
const DEBOUNCE_MS = 5 * 60 * 1000 // 5 min entre requests (respeta rate limit del backend)

/**
 * Hook para el chat de IA.
 * POST /api/ia/conversacion
 *
 * @returns {Object} Mutation result con { mutate, mutateAsync, data, isPending, isError, error }
 *
 * Usage:
 *   const chat = useChat()
 *   const res = await chat.mutateAsync({ mensaje: 'Hola', historial: [] })
 *   // res.respuesta = texto de la IA
 *   // res.simulado = true/false (si es respuesta de demo)
 */
export function useChat() {
  return useMutation({
    mutationFn: (data) => api.post('/ia/conversacion', data).then(r => r.data),
    onError: (error) => {
      // Manejo específico para rate limit 429
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
 * Usage:
 *   const { data, isLoading, canFetch, fetch } = useAINextSteps()
 *   // User clicks button → call fetch()
 *
 * Debounce persistido en localStorage (sobrevive remounts y refresh).
 * NO se auto-dispara en mount.
 */
export function useAINextSteps() {
  const { token } = useAuthStore()
  const qc = useQueryClient()

  // Read cached data if available (from queryClient cache)
  const cached = qc.getQueryData(['ai', 'next-steps'])

  const mutation = useMutation({
    mutationFn: () => api.post('/ia/recomendaciones', {}).then(r => r.data),
    onSuccess: (data) => {
      qc.setQueryData(['ai', 'next-steps'], data)
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        // Resetear debounce para que el usuario pueda reintentar después
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
    canFetch, // () => boolean — check if cooldown has passed
    fetch,    // call this on user action only
    refetch: fetch,
  }
}

/**
 * Recomendaciones IA personalizadas para un familiar específico (on-demand).
 *
 * POST /api/ia/recomendaciones
 * Body: { dependienteId: string }
 *
 * @param {string} dependentId - ID del dependiente
 * @returns {Object} Mutation result
 */
export function useAIForDependent() {
  return useMutation({
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
 *
 * Response shape:
 *   { resumenUnParrafo: string, resumenTresParrafos: object, simulado: boolean }
 *
 * Usage:
 *   const resumen = useAIResumen()
 *   // User clicks button → call resumen.fetch()
 *   const data = resumen.data
 */
const RESUMEN_STORAGE_KEY = 'ai_resumen_last_fetch_ts'
const RESUMEN_DEBOUNCE_MS = 5 * 60 * 1000 // 5 min entre requests

export function useAIResumen() {
  const { token } = useAuthStore()
  const qc = useQueryClient()
  const cached = qc.getQueryData(['ai', 'resumen'])

  const mutation = useMutation({
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
