import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../shared/lib/api'

export function useConversations() {
  return useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: () => api.get('/messages/conversations').then(r => r.data),
    refetchInterval: 15000, // poll cada 15s para mensajes nuevos
  })
}

export function useMessages(partnerId) {
  return useQuery({
    queryKey: ['messages', 'with', partnerId],
    queryFn: () => api.get(`/messages/with/${partnerId}`).then(r => r.data),
    enabled: !!partnerId,
    refetchInterval: 8000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: () => api.get('/messages/unread-count').then(r => r.data),
    refetchInterval: 30000,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ toId, content }) =>
      api.post(`/messages/send/${toId}`, { content }).then(r => r.data),
    onSuccess: (_, { toId }) => {
      qc.invalidateQueries({ queryKey: ['messages', 'with', toId] })
      qc.invalidateQueries({ queryKey: ['messages', 'conversations'] })
    },
  })
}
