import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type {
  Conversation,
  DirectMessage,
  MessagePartner,
  SendMessagePayload,
} from '@/types/social'

interface RawSocio {
  id?: string | number
  email?: string
  nombreCompleto?: string
  full_name?: string
  rol?: string
  role?: string
  ciudad?: string
  city?: string
  estado?: string
  state?: string
  urlAvatar?: string | null
  avatar_url?: string | null
  activo?: boolean
  is_active?: boolean
  verificado?: boolean
  is_verified?: boolean
}

interface RawConversation {
  socio?: RawSocio
  partner?: RawSocio
  ultimoMensaje?: string
  last_message?: string
  ultimoEn?: string
  last_message_time?: string
  noLeidos?: number
  unread?: number
  [key: string]: unknown
}

interface RawMessage {
  id?: string | number
  remitenteId?: string | number
  emisorId?: string | number
  from_id?: string | number
  from?: string | number
  destinatarioId?: string | number
  receptorId?: string | number
  to_id?: string | number
  to?: string | number
  contenido?: string
  content?: string
  text?: string
  fechaCreacion?: string
  created_at?: string
  timestamp?: string
  leido?: boolean
  read?: boolean
  [key: string]: unknown
}

/**
 * Mapea una conversación del backend al formato que el frontend espera.
 */
function mapConversation(conv: RawConversation): Conversation {
  const socio = conv.socio ?? conv.partner ?? {}
  const partner: MessagePartner = {
    id: socio.id ?? '',
    email: socio.email,
    full_name: socio.nombreCompleto ?? socio.full_name ?? 'Sin nombre',
    role: socio.rol ?? socio.role,
    city: socio.ciudad ?? socio.city,
    state: socio.estado ?? socio.state,
    avatar_url: socio.urlAvatar ?? socio.avatar_url ?? null,
    is_active: socio.activo ?? socio.is_active,
    is_verified: socio.verificado ?? socio.is_verified,
  }
  return {
    ...conv,
    partner,
    last_message: conv.ultimoMensaje ?? conv.last_message ?? '',
    last_message_time: conv.ultimoEn ?? conv.last_message_time,
    unread: conv.noLeidos ?? conv.unread ?? 0,
  }
}

/**
 * Mapea un mensaje del backend al formato que el frontend espera.
 */
function mapMessage(msg: RawMessage): DirectMessage {
  return {
    ...msg,
    id: msg.id ?? '',
    from_id: msg.remitenteId ?? msg.emisorId ?? msg.from_id ?? msg.from,
    to_id: msg.destinatarioId ?? msg.receptorId ?? msg.to_id ?? msg.to,
    content: msg.contenido ?? msg.content ?? msg.text ?? '',
    created_at: msg.fechaCreacion ?? msg.created_at ?? msg.timestamp,
    read: msg.leido ?? msg.read ?? false,
  }
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ['messages', 'conversations'],
    queryFn: () => api.get('/mensajes/conversaciones').then(r => {
      const res = r.data
      const arr: RawConversation[] = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapConversation)
    }),
    refetchInterval: 15000,
  })
}

export function useMessages(partnerId: string | number | null | undefined) {
  return useQuery<DirectMessage[]>({
    queryKey: ['messages', 'with', partnerId],
    queryFn: () => api.get(`/mensajes/con/${partnerId}`).then(r => {
      const res = r.data
      const arr: RawMessage[] = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapMessage)
    }),
    enabled: !!partnerId,
    refetchInterval: 8000,
  })
}

export function useUnreadCount() {
  return useQuery<number>({
    queryKey: ['messages', 'unread'],
    queryFn: () => api.get('/mensajes/no-leidos').then(r => {
      const data = r.data
      if (typeof data === 'number') return data
      if (typeof data === 'string') return Number(data) || 0
      return (data as { cantidad?: number; noLeidos?: number })?.cantidad ?? (data as { cantidad?: number; noLeidos?: number })?.noLeidos ?? 0
    }),
    refetchInterval: 30000,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, SendMessagePayload>({
    mutationFn: ({ toId, content }) =>
      api.post(`/mensajes/enviar/${toId}`, { contenido: content }).then(r => r.data),
    onSuccess: (_, { toId }) => {
      qc.invalidateQueries({ queryKey: ['messages', 'with', toId] })
      qc.invalidateQueries({ queryKey: ['messages', 'conversations'] })
    },
  })
}
