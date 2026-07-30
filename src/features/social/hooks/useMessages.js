import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * Mapea una conversación del backend al formato que el frontend espera.
 *
 * Backend: { socio: { id, nombreCompleto, urlAvatar, ... }, ultimoMensaje, ultimoEn, noLeidos }
 * Frontend: { partner: { id, full_name, avatar_url, ... }, last_message, last_message_time, unread }
 */
function mapConversation(conv) {
  const socio = conv.socio ?? conv.partner ?? {}
  return {
    ...conv,
    partner: {
      id: socio.id,
      email: socio.email,
      full_name: socio.nombreCompleto ?? socio.full_name ?? 'Sin nombre',
      role: socio.rol ?? socio.role,
      city: socio.ciudad ?? socio.city,
      state: socio.estado ?? socio.state,
      avatar_url: socio.urlAvatar ?? socio.avatar_url ?? null,
      is_active: socio.activo ?? socio.is_active,
      is_verified: socio.verificado ?? socio.is_verified,
    },
    last_message: conv.ultimoMensaje ?? conv.last_message ?? '',
    last_message_time: conv.ultimoEn ?? conv.last_message_time,
    unread: conv.noLeidos ?? conv.unread ?? 0,
  }
}

/**
 * Mapea un mensaje del backend al formato que el frontend espera.
 *
 * Backend: { id, emisorId, receptorId, contenido, fechaCreacion, leido }
 * Frontend: { id, from_id, to_id, content, created_at }
 */
function mapMessage(msg) {
  return {
    ...msg,
    from_id: msg.emisorId ?? msg.from_id ?? msg.from,
    to_id: msg.receptorId ?? msg.to_id ?? msg.to,
    content: msg.contenido ?? msg.content ?? msg.text,
    created_at: msg.fechaCreacion ?? msg.created_at ?? msg.timestamp,
    read: msg.leido ?? msg.read ?? false,
  }
}

export function useConversations() {
  return useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: () => api.get('/mensajes/conversaciones').then(r => {
      const res = r.data
      const arr = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapConversation)
    }),
    refetchInterval: 15000,
  })
}

export function useMessages(partnerId) {
  return useQuery({
    queryKey: ['messages', 'with', partnerId],
    queryFn: () => api.get(`/mensajes/con/${partnerId}`).then(r => {
      const res = r.data
      const arr = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapMessage)
    }),
    enabled: !!partnerId,
    refetchInterval: 8000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: () => api.get('/mensajes/no-leidos').then(r => {
      // El backend devuelve un número directo como text/html (ej: "0")
      const data = r.data
      if (typeof data === 'number') return data
      if (typeof data === 'string') return Number(data) || 0
      return data?.cantidad ?? data?.noLeidos ?? 0
    }),
    refetchInterval: 30000,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ toId, content }) =>
      api.post(`/mensajes/enviar/${toId}`, { contenido: content }).then(r => r.data),
    onSuccess: (_, { toId }) => {
      qc.invalidateQueries({ queryKey: ['messages', 'with', toId] })
      qc.invalidateQueries({ queryKey: ['messages', 'conversations'] })
    },
  })
}
