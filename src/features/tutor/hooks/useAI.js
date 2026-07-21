import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../../../shared/lib/api'
import { useAuthStore } from '@features/auth/store/authStore'

export function useChat() {
  return useMutation({
    mutationFn: (data) => api.post('/ai/chat', data).then(r => r.data),
  })
}

export function useAINextSteps() {
  const { token } = useAuthStore()
  return useQuery({
    queryKey: ['ai', 'next-steps'],
    queryFn: () => api.post('/ai/recommendations').then(r => r.data),
    enabled: !!token,
    staleTime: 1000 * 60 * 15,
    retry: 1,
  })
}

// Recomendaciones IA personalizadas para un familiar específico (on-demand)
export function useAIForDependent() {
  return useMutation({
    mutationFn: (dependentId) =>
      api.post('/ai/recommendations', { dependent_id: dependentId }).then(r => r.data),
  })
}
