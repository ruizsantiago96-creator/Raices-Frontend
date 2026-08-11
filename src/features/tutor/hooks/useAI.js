import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import { useCallback } from 'react'

const STORAGE_KEY = 'ai_last_fetch_ts'
const DEBOUNCE_MS = 5 * 60 * 1000 // 5 min entre requests (respeta rate limit del backend)

export function useChat() {
  return useMutation({
    mutationFn: (data) => api.post('/ia/conversacion', data).then(r => r.data),
  })
}

/**
 * AI Recommendations — MANUAL trigger only (prevents 429 spam).
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
    mutationFn: () => api.post('/ia/recomendaciones').then(r => r.data),
    onSuccess: (data) => {
      qc.setQueryData(['ai', 'next-steps'], data)
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
    canFetch, // () => boolean — check if cooldown has passed
    fetch,    // call this on user action only
    refetch: fetch,
  }
}

// Recomendaciones IA personalizadas para un familiar específico (on-demand)
export function useAIForDependent() {
  return useMutation({
    mutationFn: (dependentId) =>
      api.post('/ia/recomendaciones', { dependienteId: dependentId }).then(r => r.data),
  })
}
