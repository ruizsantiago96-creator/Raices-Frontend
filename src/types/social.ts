/**
 * Tipos de dominio para el Módulo Social, Mensajería y Comunidad.
 */

// ─── Grupos de Comunidad ──────────────────────────────────────────
export interface CommunityGroup {
  id: string | number
  name: string
  nombre?: string
  description?: string
  descripcion?: string
  is_public?: boolean
  esPublico?: boolean
  is_member: boolean
  member_count: number
  [key: string]: unknown
}

// ─── Publicaciones y Comentarios ──────────────────────────────────
export interface CommunityPost {
  id: string | number
  title?: string
  content: string
  author_id?: string | number
  author_name: string
  author_avatar?: string | null
  like_count: number
  liked_by_me: boolean
  created_at: string
  group_name?: string
  grupoId?: string | number
  comment_count: number
  [key: string]: unknown
}

export interface CommunityComment {
  id: string | number
  content: string
  author_id?: string | number
  author_name: string
  author_avatar?: string | null
  created_at: string
  _isOptimistic?: boolean
  [key: string]: unknown
}

export interface CreatePostPayload {
  content?: string
  contenido?: string
  grupoId?: string | number
  [key: string]: unknown
}

export interface CreateCommentPayload {
  content?: string
  contenido?: string
  authorName?: string
  authorId?: string | number
  [key: string]: unknown
}

// ─── Miembros Destacados y Métricas ──────────────────────────────
export interface FeaturedMember {
  id: string | number
  nombreCompleto: string
  rol?: string
  ciudad?: string
  estado?: string
  urlAvatar?: string | null
  biografia?: string
  [key: string]: unknown
}

export interface CommunityStats {
  totalMiembros?: number
  totalGrupos?: number
  totalPublicaciones?: number
  totalConexiones?: number
  [key: string]: unknown
}

// ─── Foros Institucionales ────────────────────────────────────────
export interface ForoRespuesta {
  id: string | number
  contenido: string
  preguntaIndex?: number
  autorNombre: string
  autorId: string | number
  autorAvatar?: string | null
  fechaCreacion: string
  [key: string]: unknown
}

export interface PreguntaConRespuestas {
  pregunta: string
  respuestas: ForoRespuesta[]
}

export interface ForoItem {
  id: string | number
  titulo: string
  descripcion: string
  preguntaDetonante: string
  preguntasDetonantes: string[]
  autorNombre: string
  autorId: string | number
  respuestasCount: number
  fechaCreacion: string
  exclusivoPadres: boolean
  activo: boolean
  [key: string]: unknown
}

export interface ForoDetalle extends ForoItem {
  respuestas: ForoRespuesta[]
  preguntasConRespuestas: PreguntaConRespuestas[]
}

// ─── Mensajes Directos y Conversaciones ───────────────────────────
export interface MessagePartner {
  id: string | number
  email?: string
  full_name: string
  role?: string
  city?: string
  state?: string
  avatar_url?: string | null
  is_active?: boolean
  is_verified?: boolean
  [key: string]: unknown
}

export interface Conversation {
  partner: MessagePartner
  last_message: string
  last_message_time?: string
  unread: number
  [key: string]: unknown
}

export interface DirectMessage {
  id: string | number
  from_id?: string | number
  to_id?: string | number
  content: string
  created_at?: string
  read?: boolean
  [key: string]: unknown
}

export interface SendMessagePayload {
  toId: string | number
  content: string
}
