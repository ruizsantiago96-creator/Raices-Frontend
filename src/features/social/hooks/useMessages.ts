import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { decodeAvatarUrl } from '../../../shared/lib/urlUtils'
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
  isDeleted?: boolean
  destinatarioActivo?: boolean
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

/** Nombre mostrado cuando el socio fue eliminado de la plataforma. */
export const USUARIO_ELIMINADO = 'Usuario Eliminado'

/** Forma mínima necesaria para decidir si un socio está eliminado. */
type SocioEstado = {
  isDeleted?: boolean
  destinatarioActivo?: boolean
  partner?: { full_name?: string; is_active?: boolean } | null
}

/**
 * Un socio está eliminado si el backend lo marcó con `isDeleted` o, en su
 * respuesta, con el alias semántico `destinatarioActivo: false`. También se infiere
 * de `activo: false` para tolerar respuestas de backends previos al flag.
 */
export function isConversacionEliminada(conv: SocioEstado): boolean {
  if (typeof conv.isDeleted === 'boolean') return conv.isDeleted
  if (typeof conv.destinatarioActivo === 'boolean') return !conv.destinatarioActivo
  return conv.partner?.is_active === false
}

/**
 * Nombre a mostrar para el socio. Si la cuenta fue eliminada se muestra siempre
 * "Usuario Eliminado", sin importar lo que devuelva el backend.
 */
export function nombreParaMostrar(conv: SocioEstado): string {
  return isConversacionEliminada(conv) ? USUARIO_ELIMINADO : conv.partner?.full_name ?? 'Sin nombre'
}

/**
 * Mapea una conversación del backend al formato que el frontend espera.
 */
function mapConversation(conv: RawConversation): Conversation {
  const socio = conv.socio ?? conv.partner ?? {}
  // El backend ya omite la PII de las cuentas dadas de baja, pero se normaliza
  // aquí también para no confiar en el nombre real si el backend lo enviara.
  const isDeleted = isConversacionEliminada({ ...conv, partner: socio })
  const partner: MessagePartner = {
    id: socio.id ?? '',
    email: isDeleted ? undefined : socio.email,
    full_name: isDeleted ? USUARIO_ELIMINADO : (socio.nombreCompleto ?? socio.full_name ?? 'Sin nombre'),
    role: socio.rol ?? socio.role,
    city: socio.ciudad ?? socio.city,
    state: socio.estado ?? socio.state,
    avatar_url: isDeleted ? null : decodeAvatarUrl(socio.urlAvatar ?? socio.avatar_url ?? null),
    is_active: !isDeleted && (socio.activo ?? socio.is_active ?? true),
    is_verified: socio.verificado ?? socio.is_verified,
  }
  return {
    ...conv,
    partner,
    last_message: conv.ultimoMensaje ?? conv.last_message ?? '',
    last_message_time: conv.ultimoEn ?? conv.last_message_time,
    unread: conv.noLeidos ?? conv.unread ?? 0,
    isDeleted,
    destinatarioActivo: !isDeleted,
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
    queryKey: ['messages', 'conversations'],    queryFn: () => api.get('/mensajes/conversaciones').then(r => {      const res = r.data      const arr: RawConversation[] = Array.isArray(res) ? res : (res?.datos ?? [])      return arr.map(mapConversation)    }),
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

export interface EliminarConversacionResultado {
  /** `true` si la conversación quedó oculta para el usuario autenticado. */
  ocultado: boolean
  /** Socio de la conversación borrada. */
  socioId: string
}

/**
 * "Eliminar chat" (DELETE /mensajes/conversaciones/:userId).
 *
 * El borrado es lógico y por usuario en el backend, así que tras el 200 la
 * conversación no volverá aunque el polling (15 s) la vuelva a pedir. Aun así se
 * quita de la caché de inmediato para que la UI responda al instante.
 */
export function useDeleteConversation() {
  const qc = useQueryClient()
  return useMutation<EliminarConversacionResultado, Error, string | number>({
    mutationFn: (userId) =>
      api.delete<EliminarConversacionResultado>(`/mensajes/conversaciones/${userId}`).then(r => r.data),
    onSuccess: (_res, userId) => {
      const id = String(userId)
      qc.setQueryData<Conversation[]>(['messages', 'conversations'], prev =>
        prev?.filter(c => String(c.partner?.id) !== id),
      )
      qc.removeQueries({ queryKey: ['messages', 'with', userId] })
      qc.invalidateQueries({ queryKey: ['messages', 'conversations'] })
      qc.invalidateQueries({ queryKey: ['messages', 'unread'] })
    },
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

/**
 * Marca como leídos los mensajes recibidos de un socio (PATCH /mensajes/leer/:id).
 * Se invoca al abrir una conversación; refresca no-leídos y conversaciones.
 */
export function useMarcarConversacionLeida() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, string | number>({
    mutationFn: (socioId) => api.patch(`/mensajes/leer/${socioId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', 'unread'] })
      qc.invalidateQueries({ queryKey: ['messages', 'conversations'] })
    },
  })
}
